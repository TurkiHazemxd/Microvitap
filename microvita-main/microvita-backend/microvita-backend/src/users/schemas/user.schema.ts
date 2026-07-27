import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CONSUMER = 'consumer',
  BIOLOGIST = 'biologist',
  NUTRITIONIST = 'nutritionist',
  ADMIN = 'admin',
  DISTRIBUTOR = 'distributor',
}

@Schema({ 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  motdepasse: string;

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CONSUMER })
  role: UserRole;

  @Prop({ default: Date.now })
  dateinscription: Date;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  country: string;
  id: any;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtual id property
UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
});