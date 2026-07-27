"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
const user_schema_1 = require("../users/schemas/user.schema");
const password_reset_schema_1 = require("./schemas/password-reset.schema");
const email_service_1 = require("../email/email.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, emailService, userModel, passwordResetModel) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.userModel = userModel;
        this.passwordResetModel = passwordResetModel;
    }
    async register(registerDto) {
        const { email, fullname, motdepasse } = registerDto;
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const user = await this.usersService.create({
            email,
            fullname,
            motdepasse,
        });
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.fullname,
                role: user.role,
            },
            token,
        };
    }
    async login(loginDto) {
        const { email, motdepasse } = loginDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isValid = await this.usersService.validatePassword(user, motdepasse);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const userId = user._id.toString();
        await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() });
        const token = this.jwtService.sign({
            sub: userId,
            email: user.email,
            role: user.role,
        });
        return {
            user: {
                id: userId,
                email: user.email,
                name: user.fullname,
                role: user.role,
            },
            token,
        };
    }
    async validateUser(userId) {
        console.log('Validating user with ID:', userId);
        return this.usersService.findById(userId);
    }
    async sendResetCode(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return { message: 'If an account exists with this email, you will receive a reset code.' };
        }
        await this.passwordResetModel.deleteMany({ userId: user._id }).exec();
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        const resetCode = new this.passwordResetModel({
            userId: user._id,
            code: code,
            expiresAt: new Date(Date.now() + 600000),
        });
        await resetCode.save();
        await this.emailService.sendPasswordResetCode(user.email, user.fullname, code);
        return { message: 'Reset code sent successfully' };
    }
    async verifyResetCode(email, code) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return { valid: false };
        }
        const resetCode = await this.passwordResetModel.findOne({
            userId: user._id,
            code: code
        }).exec();
        if (!resetCode) {
            return { valid: false };
        }
        if (resetCode.expiresAt < new Date()) {
            await this.passwordResetModel.deleteOne({ code }).exec();
            return { valid: false };
        }
        return { valid: true };
    }
    async resetPasswordWithCode(email, code, newPassword) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.BadRequestException('Invalid request');
        }
        const resetCode = await this.passwordResetModel.findOne({
            userId: user._id,
            code: code
        }).exec();
        if (!resetCode) {
            throw new common_1.BadRequestException('Invalid or expired reset code');
        }
        if (resetCode.expiresAt < new Date()) {
            await this.passwordResetModel.deleteOne({ code }).exec();
            throw new common_1.BadRequestException('Reset code has expired');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.motdepasse = hashedPassword;
        await user.save();
        await this.passwordResetModel.deleteOne({ code }).exec();
        return true;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(4, (0, mongoose_1.InjectModel)(password_reset_schema_1.PasswordReset.name)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        email_service_1.EmailService,
        mongoose_2.Model,
        mongoose_2.Model])
], AuthService);
//# sourceMappingURL=auth.service.js.map