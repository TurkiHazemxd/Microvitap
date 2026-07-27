import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TreatmentDocument = Treatment & Document;

@Schema({ timestamps: true })
export class Treatment {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  dateCreation: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  typeGelule: string;

  @Prop({ type: Types.ObjectId, ref: 'Microgreen' })
  microgreenId: Types.ObjectId;
}

export const TreatmentSchema = SchemaFactory.createForClass(Treatment);