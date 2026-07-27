import { UserRole } from '../schemas/user.schema';
export declare class CreateUserDto {
    email: string;
    motdepasse: string;
    fullname: string;
    role?: UserRole;
}
