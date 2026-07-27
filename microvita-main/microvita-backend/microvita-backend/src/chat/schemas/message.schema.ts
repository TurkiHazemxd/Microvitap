// src/chat/schemas/message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Conversation' })
  conversationId: Types.ObjectId;

  @Prop({ required: true })
  contenu: string;

  @Prop({ required: true, enum: ['user', 'assistant'] })
  rédacteur: string;

  @Prop({ default: Date.now })
  dateEnvoi: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Add virtual id property
MessageSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

MessageSchema.set('toJSON', { virtuals: true });
MessageSchema.set('toObject', { virtuals: true });