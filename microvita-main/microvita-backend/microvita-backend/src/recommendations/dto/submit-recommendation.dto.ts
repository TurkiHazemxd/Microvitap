import { IsObject, IsNotEmpty } from 'class-validator';

export class SubmitRecommendationDto {
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, any>;
}