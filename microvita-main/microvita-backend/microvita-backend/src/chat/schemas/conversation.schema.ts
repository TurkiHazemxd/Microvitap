// src/chat/schemas/conversation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  titre: string;

  @Prop({ default: Date.now })
  dateDebut: Date;

  @Prop({ default: Date.now })
  dateModification: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Add virtual id property
ConversationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

ConversationSchema.set('toJSON', { virtuals: true });
ConversationSchema.set('toObject', { virtuals: true });