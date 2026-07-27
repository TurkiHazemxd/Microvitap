import { Document, Types } from 'mongoose';
export type RecommendationDocument = Recommendation & Document;
export declare class Recommendation {
    userId: Types.ObjectId;
    userName: string;
    userEmail: string;
    answers: Record<string, any>;
    status: string;
    nutritionistNotes: string;
    assignedPlanId: Types.ObjectId;
    reviewedAt: Date;
}
export declare const RecommendationSchema: import("mongoose").Schema<Recommendation, import("mongoose").Model<Recommendation, any, any, any, Document<unknown, any, Recommendation, any, {}> & Recommendation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Recommendation, Document<unknown, {}, import("mongoose").FlatRecord<Recommendation>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Recommendation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
