import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecommendationDocument = Recommendation & Document;

@Schema({ timestamps: true })
export class Recommendation {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ type: Object, required: true })
  answers: Record<string, any>;

  @Prop({ default: 'pending' })
  status: string; // pending, reviewed, completed

  @Prop()
  nutritionistNotes: string;

  @Prop({ type: Types.ObjectId, ref: 'NutritionalPlan', default: null })
  assignedPlanId: Types.ObjectId;

  @Prop()
  reviewedAt: Date;
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);

RecommendationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

RecommendationSchema.set('toJSON', { virtuals: true });
RecommendationSchema.set('toObject', { virtuals: true });