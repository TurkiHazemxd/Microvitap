import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  motdepasse: string;

  @IsString()
  fullname: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}