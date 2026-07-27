import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  nom: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsArray()
  @IsOptional()
  ingredients?: string[];

  @IsArray()
  @IsOptional()
  instructions?: string[];

  @IsString()
  @IsOptional()
  image?: string;
}