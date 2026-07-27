import { IsEmail, IsString, IsNotEmpty, MinLength, Length } from 'class-validator';

export class ResetPasswordWithCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(5, 5)
  @IsNotEmpty()
  code: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}