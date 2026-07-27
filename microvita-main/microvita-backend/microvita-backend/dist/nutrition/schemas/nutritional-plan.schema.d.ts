import { Document, Types } from 'mongoose';
export type NutritionalPlanDocument = NutritionalPlan & Document;
export declare class NutritionalPlan {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    dailyMeals: any[];
    recommendations: string[];
    supplements: string[];
    status: string;
    progress: number;
    nutritionistId: Types.ObjectId;
    assignedTo: Types.ObjectId;
}
export declare const NutritionalPlanSchema: import("mongoose").Schema<NutritionalPlan, import("mongoose").Model<NutritionalPlan, any, any, any, Document<unknown, any, NutritionalPlan, any, {}> & NutritionalPlan & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NutritionalPlan, Document<unknown, {}, import("mongoose").FlatRecord<NutritionalPlan>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<NutritionalPlan> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
