import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema({ timestamps: true })
export class Recipe {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  nom: string;

  @Prop()
  image: string;

  @Prop()
  time: string;

  @Prop()
  author: string;

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop({ type: [String], default: [] })
  instructions: string[];

  @Prop({ default: false })
  isFavorite: boolean;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);