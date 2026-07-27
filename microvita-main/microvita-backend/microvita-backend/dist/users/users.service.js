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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("./schemas/user.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        const { email, motdepasse, fullname, role } = createUserDto;
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(motdepasse, 10);
        const user = new this.userModel({
            email,
            motdepasse: hashedPassword,
            fullname,
            role: role || user_schema_1.UserRole.CONSUMER,
        });
        return user.save();
    }
    async findAll() {
        return this.userModel.find().select('-motdepasse').exec();
    }
    async findById(id) {
        if (!id) {
            throw new common_1.NotFoundException('User id is missing');
        }
        const user = await this.userModel
            .findOne({
            $or: [
                { _id: id },
                { id: id },
            ],
        })
            .select('-motdepasse')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async update(id, updateUserDto) {
        if (!id) {
            throw new common_1.NotFoundException('User id is missing');
        }
        if (updateUserDto.email) {
            const existing = await this.userModel.findOne({ email: updateUserDto.email });
            if (existing && existing._id.toString() !== id) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        const user = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .select('-motdepasse')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async remove(id) {
        if (!id) {
            throw new common_1.NotFoundException('User id is missing');
        }
        const result = await this.userModel.findOneAndDelete({
            $or: [
                { _id: id },
                { id: id },
            ],
        }).exec();
        if (!result) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async validatePassword(user, password) {
        return bcrypt.compare(password, user.motdepasse);
    }
    async getStats() {
        const total = await this.userModel.countDocuments();
        const byRole = await this.userModel.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        return { total, byRole };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map