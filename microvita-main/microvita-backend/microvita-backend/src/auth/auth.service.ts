import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { PasswordReset, PasswordResetDocument } from './schemas/password-reset.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(PasswordReset.name) private passwordResetModel: Model<PasswordResetDocument>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, fullname, motdepasse } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
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

  async login(loginDto: LoginDto) {
    const { email, motdepasse } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.usersService.validatePassword(user, motdepasse);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
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

  async validateUser(userId: string) {
    console.log('Validating user with ID:', userId);
    return this.usersService.findById(userId);
  }

  // Generate and send reset code
  async sendResetCode(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return { message: 'If an account exists with this email, you will receive a reset code.' };
    }

    // Delete any existing reset codes for this user
    await this.passwordResetModel.deleteMany({ userId: user._id }).exec();

    // Generate 5-digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    
    const resetCode = new this.passwordResetModel({
      userId: user._id,
      code: code,
      expiresAt: new Date(Date.now() + 600000), // 10 minutes
    });
    
    await resetCode.save();

    // Send email with code
    await this.emailService.sendPasswordResetCode(user.email, user.fullname, code);

    return { message: 'Reset code sent successfully' };
  }

  // Verify reset code
  async verifyResetCode(email: string, code: string): Promise<{ valid: boolean }> {
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

  // Reset password with code
  async resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new BadRequestException('Invalid request');
    }

    const resetCode = await this.passwordResetModel.findOne({ 
      userId: user._id, 
      code: code 
    }).exec();
    
    if (!resetCode) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    if (resetCode.expiresAt < new Date()) {
      await this.passwordResetModel.deleteOne({ code }).exec();
      throw new BadRequestException('Reset code has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.motdepasse = hashedPassword;
    await user.save();

    // Delete the used code
    await this.passwordResetModel.deleteOne({ code }).exec();

    return true;
  }
}