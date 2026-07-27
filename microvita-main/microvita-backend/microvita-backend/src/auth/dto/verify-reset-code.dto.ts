import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyResetCodeDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(5, 5)
  @IsNotEmpty()
  code: string;
}