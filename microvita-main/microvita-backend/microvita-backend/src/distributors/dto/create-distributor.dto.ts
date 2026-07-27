import { IsString, IsArray, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreateDistributorDto {
  @IsString()
  name: string;

  @IsEnum(['Restaurant', 'Point de Vente', 'Fournisseur'])
  type: string;

  @IsString()
  city: string;

  @IsString()
  phone: string;

  @IsArray()
  @IsOptional()
  products?: { name: string; image: string }[];

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  openingHours?: string;

  @IsBoolean()
  @IsOptional()
  deliveryAvailable?: boolean;

  @IsString()
  @IsOptional()
  minOrder?: string;

  @IsArray()
  @IsOptional()
  paymentMethods?: string[];

  @IsArray()
  @IsOptional()
  certifications?: string[];
}