import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { PasswordResetDocument } from './schemas/password-reset.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private emailService;
    private userModel;
    private passwordResetModel;
    constructor(usersService: UsersService, jwtService: JwtService, emailService: EmailService, userModel: Model<UserDocument>, passwordResetModel: Model<PasswordResetDocument>);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: any;
            email: string;
            name: string;
            role: import("../users/schemas/user.schema").UserRole;
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../users/schemas/user.schema").UserRole;
        };
        token: string;
    }>;
    validateUser(userId: string): Promise<UserDocument>;
    sendResetCode(email: string): Promise<{
        message: string;
    }>;
    verifyResetCode(email: string, code: string): Promise<{
        valid: boolean;
    }>;
    resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<boolean>;
}
