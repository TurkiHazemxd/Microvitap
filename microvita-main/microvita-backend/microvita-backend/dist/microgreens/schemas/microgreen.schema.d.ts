import { Document } from 'mongoose';
export type MicrogreenDocument = Microgreen & Document;
export declare class Microgreen {
    id: string;
    nom: string;
    image: string;
    additionalImages: string[];
    description: string;
    gout: string;
    bienfaits: string[];
    teneurFer: string;
    teneurCalcium: string;
    protéines: string;
    glucoses: string;
}
export declare const MicrogreenSchema: import("mongoose").Schema<Microgreen, import("mongoose").Model<Microgreen, any, any, any, Document<unknown, any, Microgreen, any, {}> & Microgreen & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Microgreen, Document<unknown, {}, import("mongoose").FlatRecord<Microgreen>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Microgreen> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
