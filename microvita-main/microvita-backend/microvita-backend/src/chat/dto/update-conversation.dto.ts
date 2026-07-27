// src/chat/dto/update-conversation.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  titre?: string;
}