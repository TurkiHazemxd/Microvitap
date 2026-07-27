import { Document } from 'mongoose';
export type DistributorDocument = Distributor & Document;
export declare class Distributor {
    id: string;
    name: string;
    type: string;
    city: string;
    phone: string;
    products: {
        name: string;
        image: string;
    }[];
    address: string;
    openingHours: string;
    deliveryAvailable: boolean;
    minOrder: string;
    paymentMethods: string[];
    certifications: string[];
}
export declare const DistributorSchema: import("mongoose").Schema<Distributor, import("mongoose").Model<Distributor, any, any, any, Document<unknown, any, Distributor, any, {}> & Distributor & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Distributor, Document<unknown, {}, import("mongoose").FlatRecord<Distributor>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Distributor> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
