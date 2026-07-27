// src/chat/dto/create-message.dto.ts
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  contenu: string;

  @IsEnum(['user', 'assistant'])
  @IsNotEmpty()
  rédacteur: string;
}