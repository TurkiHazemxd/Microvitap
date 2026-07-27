import { Model } from 'mongoose';
import { ConversationDocument } from './schemas/conversation.schema';
import { MessageDocument } from './schemas/message.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatService {
    private conversationModel;
    private messageModel;
    constructor(conversationModel: Model<ConversationDocument>, messageModel: Model<MessageDocument>);
    createConversation(userId: string, createConversationDto: CreateConversationDto): Promise<ConversationDocument>;
    getUserConversations(userId: string): Promise<ConversationDocument[]>;
    getConversationById(conversationId: string, userId: string): Promise<ConversationDocument>;
    updateConversation(conversationId: string, userId: string, updateConversationDto: UpdateConversationDto): Promise<ConversationDocument>;
    deleteConversation(conversationId: string, userId: string): Promise<{
        deleted: boolean;
    }>;
    addMessage(conversationId: string, userId: string, createMessageDto: CreateMessageDto): Promise<MessageDocument>;
    getConversationMessages(conversationId: string, userId: string): Promise<MessageDocument[]>;
    deleteMessage(messageId: string, userId: string): Promise<{
        deleted: boolean;
    }>;
}
