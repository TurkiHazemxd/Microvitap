// src/chat/dto/create-conversation.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  titre: string;
}