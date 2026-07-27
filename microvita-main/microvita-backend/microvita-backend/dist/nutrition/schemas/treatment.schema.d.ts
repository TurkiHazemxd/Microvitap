import { Document, Types } from 'mongoose';
export type TreatmentDocument = Treatment & Document;
export declare class Treatment {
    id: string;
    dateCreation: Date;
    description: string;
    typeGelule: string;
    microgreenId: Types.ObjectId;
}
export declare const TreatmentSchema: import("mongoose").Schema<Treatment, import("mongoose").Model<Treatment, any, any, any, Document<unknown, any, Treatment, any, {}> & Treatment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Treatment, Document<unknown, {}, import("mongoose").FlatRecord<Treatment>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Treatment> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
