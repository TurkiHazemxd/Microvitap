import { IsString, IsOptional } from 'class-validator';

export class UpdateRecommendationStatusDto {
  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  nutritionistNotes?: string;
}