
// IMPORTS
import { IsString, IsOptional, IsArray } from 'class-validator';
// Defines the shape of data expected when creating a new microgreen
// Used by the API to validate POST requests to /microgreens
export class CreateMicrogreenDto {
  
  @IsString()
  nom: string;

  @IsString()
  @IsOptional()          
  image?: string;

  @IsArray()            
  @IsOptional()
  additionalImages?: string[];

  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  gout?: string;

  @IsArray()
  @IsOptional()
  bienfaits?: string[];
  
  @IsString()
  @IsOptional()
  teneurFer?: string;        
  @IsString()
  @IsOptional()
  teneurCalcium?: string;   

  @IsString()
  @IsOptional()
  protéines?: string;        

  @IsString()
  @IsOptional()
  glucoses?: string;         
}