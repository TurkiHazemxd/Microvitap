import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ['single', 'multiple'] })
  type: string;

  @Prop({ type: [{ id: String, label: String }], required: true })
  options: { id: string; label: string }[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);