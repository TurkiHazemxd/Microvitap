"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const conversation_schema_1 = require("./schemas/conversation.schema");
const message_schema_1 = require("./schemas/message.schema");
let ChatService = class ChatService {
    constructor(conversationModel, messageModel) {
        this.conversationModel = conversationModel;
        this.messageModel = messageModel;
    }
    async createConversation(userId, createConversationDto) {
        const conversation = new this.conversationModel({
            userId: new mongoose_2.Types.ObjectId(userId),
            titre: createConversationDto.titre,
            dateDebut: new Date(),
            dateModification: new Date(),
        });
        return conversation.save();
    }
    async getUserConversations(userId) {
        return this.conversationModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ dateModification: -1 })
            .exec();
    }
    async getConversationById(conversationId, userId) {
        const conversation = await this.conversationModel.findById(conversationId).exec();
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this conversation');
        }
        return conversation;
    }
    async updateConversation(conversationId, userId, updateConversationDto) {
        const conversation = await this.getConversationById(conversationId, userId);
        if (updateConversationDto.titre) {
            conversation.titre = updateConversationDto.titre;
        }
        conversation.dateModification = new Date();
        return conversation.save();
    }
    async deleteConversation(conversationId, userId) {
        const conversation = await this.getConversationById(conversationId, userId);
        await this.messageModel.deleteMany({ conversationId: conversation._id }).exec();
        await this.conversationModel.findByIdAndDelete(conversation._id).exec();
        return { deleted: true };
    }
    async addMessage(conversationId, userId, createMessageDto) {
        await this.getConversationById(conversationId, userId);
        const message = new this.messageModel({
            conversationId: new mongoose_2.Types.ObjectId(conversationId),
            contenu: createMessageDto.contenu,
            rédacteur: createMessageDto.rédacteur,
            dateEnvoi: new Date(),
        });
        await this.conversationModel.findByIdAndUpdate(conversationId, {
            dateModification: new Date(),
        }).exec();
        return message.save();
    }
    async getConversationMessages(conversationId, userId) {
        await this.getConversationById(conversationId, userId);
        return this.messageModel
            .find({ conversationId: new mongoose_2.Types.ObjectId(conversationId) })
            .sort({ dateEnvoi: 1 })
            .exec();
    }
    async deleteMessage(messageId, userId) {
        const message = await this.messageModel.findById(messageId).exec();
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        await this.getConversationById(message.conversationId.toString(), userId);
        await this.messageModel.findByIdAndDelete(messageId).exec();
        return { deleted: true };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(conversation_schema_1.Conversation.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ChatService);
//# sourceMappingURL=chat.service.js.map