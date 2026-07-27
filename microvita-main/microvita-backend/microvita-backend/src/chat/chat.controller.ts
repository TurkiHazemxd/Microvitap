// src/chat/chat.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Get all conversations for the authenticated user
  @Get('conversations')
  async getUserConversations(@Request() req) {
    const userId = req.user.userId;
    return this.chatService.getUserConversations(userId);
  }

  // Create a new conversation
  @Post('conversations')
  async createConversation(@Request() req, @Body() createConversationDto: CreateConversationDto) {
    const userId = req.user.userId;
    return this.chatService.createConversation(userId, createConversationDto);
  }

  // Get a specific conversation
  @Get('conversations/:id')
  async getConversation(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.chatService.getConversationById(id, userId);
  }

  // Update a conversation
  @Put('conversations/:id')
  async updateConversation(
    @Request() req,
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    const userId = req.user.userId;
    return this.chatService.updateConversation(id, userId, updateConversationDto);
  }

  // Delete a conversation
  @Delete('conversations/:id')
  async deleteConversation(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.chatService.deleteConversation(id, userId);
  }

  // Get all messages for a conversation
  @Get('conversations/:id/messages')
  async getConversationMessages(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.chatService.getConversationMessages(id, userId);
  }

  // Add a message to a conversation
  @Post('conversations/:id/messages')
  async addMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const userId = req.user.userId;
    return this.chatService.addMessage(id, userId, createMessageDto);
  }

  // Delete a single message (optional)
  @Delete('messages/:id')
  async deleteMessage(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.chatService.deleteMessage(id, userId);
  }
}