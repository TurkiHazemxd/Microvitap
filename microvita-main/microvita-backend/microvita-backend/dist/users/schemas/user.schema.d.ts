import { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    CONSUMER = "consumer",
    BIOLOGIST = "biologist",
    NUTRITIONIST = "nutritionist",
    ADMIN = "admin",
    DISTRIBUTOR = "distributor"
}
export declare class User {
    email: string;
    motdepasse: string;
    fullname: string;
    role: UserRole;
    dateinscription: Date;
    phone: string;
    country: string;
    id: any;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
