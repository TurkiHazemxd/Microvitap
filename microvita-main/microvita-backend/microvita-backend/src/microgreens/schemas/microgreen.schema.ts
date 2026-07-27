import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MicrogreenDocument = Microgreen & Document;

@Schema({ timestamps: true })
export class Microgreen {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  nom: string;

  @Prop()
  image: string;

  @Prop({ type: [String], default: [] })
  additionalImages: string[];

  @Prop()
  description: string;

  @Prop()
  gout: string;

  @Prop({ type: [String], default: [] })
  bienfaits: string[];

  // New nutritional fields
  @Prop({ default: '' })
  teneurFer: string;

  @Prop({ default: '' })
  teneurCalcium: string;

  @Prop({ default: '' })
  protéines: string;

  @Prop({ default: '' })
  glucoses: string;
}

export const MicrogreenSchema = SchemaFactory.createForClass(Microgreen);