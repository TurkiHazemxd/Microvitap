import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getUserConversations(req: any): Promise<import("./schemas/conversation.schema").ConversationDocument[]>;
    createConversation(req: any, createConversationDto: CreateConversationDto): Promise<import("./schemas/conversation.schema").ConversationDocument>;
    getConversation(req: any, id: string): Promise<import("./schemas/conversation.schema").ConversationDocument>;
    updateConversation(req: any, id: string, updateConversationDto: UpdateConversationDto): Promise<import("./schemas/conversation.schema").ConversationDocument>;
    deleteConversation(req: any, id: string): Promise<{
        deleted: boolean;
    }>;
    getConversationMessages(req: any, id: string): Promise<import("./schemas/message.schema").MessageDocument[]>;
    addMessage(req: any, id: string, createMessageDto: CreateMessageDto): Promise<import("./schemas/message.schema").MessageDocument>;
    deleteMessage(req: any, id: string): Promise<{
        deleted: boolean;
    }>;
}
