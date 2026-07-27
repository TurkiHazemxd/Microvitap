import { IsString, IsObject, IsOptional } from 'class-validator';

export class CreateRecommendationDto {
  @IsString()
  userId: string;

  @IsString()
  userName: string;

  @IsString()
  userEmail: string;

  @IsObject()
  answers: Record<string, any>;

  @IsString()
  @IsOptional()
  status?: string;
}