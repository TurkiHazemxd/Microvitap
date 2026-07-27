import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './schemas/user.schema';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        id: any;
        email: string;
        name: string;
        role: UserRole;
        phone: string;
        country: string;
    }>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<{
        id: any;
        email: string;
        name: string;
        role: UserRole;
        phone: string;
        country: string;
    }>;
    findAll(): Promise<import("./schemas/user.schema").UserDocument[]>;
    getStats(): Promise<{
        total: number;
        byRole: any[];
    }>;
    findOne(id: string): Promise<import("./schemas/user.schema").UserDocument>;
    create(createUserDto: CreateUserDto): Promise<import("./schemas/user.schema").UserDocument>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./schemas/user.schema").UserDocument>;
    remove(id: string): Promise<void>;
}
