import { Document } from 'mongoose';
export type RecipeDocument = Recipe & Document;
export declare class Recipe {
    id: string;
    nom: string;
    image: string;
    time: string;
    author: string;
    ingredients: string[];
    instructions: string[];
    isFavorite: boolean;
}
export declare const RecipeSchema: import("mongoose").Schema<Recipe, import("mongoose").Model<Recipe, any, any, any, Document<unknown, any, Recipe, any, {}> & Recipe & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Recipe, Document<unknown, {}, import("mongoose").FlatRecord<Recipe>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Recipe> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
