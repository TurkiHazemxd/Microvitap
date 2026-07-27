import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DistributorDocument = Distributor & Document;

@Schema({ timestamps: true })
export class Distributor {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['Restaurant', 'Point de Vente', 'Fournisseur'] })
  type: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: [Object], default: [] })
  products: {
    name: string;
    image: string;
  }[];

  @Prop()
  address: string;

  @Prop()
  openingHours: string;

  @Prop({ default: false })
  deliveryAvailable: boolean;

  @Prop()
  minOrder: string;

  @Prop({ type: [String], default: [] })
  paymentMethods: string[];

  @Prop({ type: [String], default: [] })
  certifications: string[];
}

export const DistributorSchema = SchemaFactory.createForClass(Distributor);