import { Document, Types } from 'mongoose';
export type PasswordResetDocument = PasswordReset & Document;
export declare class PasswordReset {
    userId: Types.ObjectId;
    code: string;
    expiresAt: Date;
}
export declare const PasswordResetSchema: import("mongoose").Schema<PasswordReset, import("mongoose").Model<PasswordReset, any, any, any, Document<unknown, any, PasswordReset, any, {}> & PasswordReset & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PasswordReset, Document<unknown, {}, import("mongoose").FlatRecord<PasswordReset>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PasswordReset> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
