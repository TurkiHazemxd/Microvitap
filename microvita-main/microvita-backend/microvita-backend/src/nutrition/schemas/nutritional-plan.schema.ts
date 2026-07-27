import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NutritionalPlanDocument = NutritionalPlan & Document;

@Schema({ timestamps: true })
export class NutritionalPlan {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ type: Array, default: [] })
  dailyMeals: any[];

  @Prop({ type: [String], default: [] })
  recommendations: string[];

  @Prop({ type: [String], default: [] })
  supplements: string[];

  @Prop({ default: 'active' })
  status: string;

  @Prop({ default: 0 })
  progress: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  nutritionistId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo: Types.ObjectId;
}

export const NutritionalPlanSchema = SchemaFactory.createForClass(NutritionalPlan);

// Add virtual id
NutritionalPlanSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

NutritionalPlanSchema.set('toJSON', { virtuals: true });
NutritionalPlanSchema.set('toObject', { virtuals: true });