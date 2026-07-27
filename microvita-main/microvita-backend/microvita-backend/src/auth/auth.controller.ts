import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordWithCodeDto } from './dto/reset-password-with-code.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('request-reset')
  @HttpCode(HttpStatus.OK)
  async requestReset(@Body() requestResetDto: RequestResetDto) {
    return this.authService.sendResetCode(requestResetDto.email);
  }

  @Public()
  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  async verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(verifyResetCodeDto.email, verifyResetCodeDto.code);
  }

  @Public()
  @Post('reset-password-with-code')
  @HttpCode(HttpStatus.OK)
  async resetPasswordWithCode(@Body() resetPasswordWithCodeDto: ResetPasswordWithCodeDto) {
    await this.authService.resetPasswordWithCode(
      resetPasswordWithCodeDto.email,
      resetPasswordWithCodeDto.code,
      resetPasswordWithCodeDto.newPassword,
    );
    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}