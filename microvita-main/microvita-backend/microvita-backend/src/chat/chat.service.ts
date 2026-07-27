// src/chat/chat.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  // Create a new conversation
  async createConversation(userId: string, createConversationDto: CreateConversationDto): Promise<ConversationDocument> {
    const conversation = new this.conversationModel({
      userId: new Types.ObjectId(userId),
      titre: createConversationDto.titre,
      dateDebut: new Date(),
      dateModification: new Date(),
    });
    return conversation.save();
  }

  // Get all conversations for a user
  async getUserConversations(userId: string): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ dateModification: -1 })
      .exec();
  }

  // Get a single conversation by ID
  async getConversationById(conversationId: string, userId: string): Promise<ConversationDocument> {
    const conversation = await this.conversationModel.findById(conversationId).exec();
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    
    // Check if the conversation belongs to the user
    if (conversation.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }
    
    return conversation;
  }

  // Update a conversation
  async updateConversation(
    conversationId: string,
    userId: string,
    updateConversationDto: UpdateConversationDto,
  ): Promise<ConversationDocument> {
    const conversation = await this.getConversationById(conversationId, userId);
    
    if (updateConversationDto.titre) {
      conversation.titre = updateConversationDto.titre;
    }
    conversation.dateModification = new Date();
    
    return conversation.save();
  }

  // Delete a conversation and all its messages
  async deleteConversation(conversationId: string, userId: string): Promise<{ deleted: boolean }> {
    const conversation = await this.getConversationById(conversationId, userId);
    
    // Delete all messages in the conversation
    await this.messageModel.deleteMany({ conversationId: conversation._id }).exec();
    
    // Delete the conversation
    await this.conversationModel.findByIdAndDelete(conversation._id).exec();
    
    return { deleted: true };
  }

  // Add a message to a conversation
  async addMessage(
    conversationId: string,
    userId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<MessageDocument> {
    // Verify conversation exists and belongs to user
    await this.getConversationById(conversationId, userId);
    
    const message = new this.messageModel({
      conversationId: new Types.ObjectId(conversationId),
      contenu: createMessageDto.contenu,
      rédacteur: createMessageDto.rédacteur,
      dateEnvoi: new Date(),
    });
    
    // Update conversation modification date
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      dateModification: new Date(),
    }).exec();
    
    return message.save();
  }

  // Get all messages for a conversation
  async getConversationMessages(conversationId: string, userId: string): Promise<MessageDocument[]> {
    // Verify conversation exists and belongs to user
    await this.getConversationById(conversationId, userId);
    
    return this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ dateEnvoi: 1 })
      .exec();
  }

  // Delete a single message (optional)
  async deleteMessage(messageId: string, userId: string): Promise<{ deleted: boolean }> {
    const message = await this.messageModel.findById(messageId).exec();
    
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    
    // Verify the conversation belongs to the user
    await this.getConversationById(message.conversationId.toString(), userId);
    
    await this.messageModel.findByIdAndDelete(messageId).exec();
    
    return { deleted: true };
  }
}