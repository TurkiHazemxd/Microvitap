import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateTreatmentDto {
  @IsDateString()
  dateCreation: string;

  @IsString()
  description: string;

  @IsString()
  typeGelule: string;

  @IsString()
  @IsOptional()
  microgreenId?: string;
}