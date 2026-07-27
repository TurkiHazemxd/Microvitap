import { IsString, IsOptional, IsArray, IsNumber, IsDateString } from 'class-validator';

export class CreateNutritionalPlanDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @IsOptional()
  dailyMeals?: any[];

  @IsArray()
  @IsOptional()
  recommendations?: string[];

  @IsArray()
  @IsOptional()
  supplements?: string[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  progress?: number;
}