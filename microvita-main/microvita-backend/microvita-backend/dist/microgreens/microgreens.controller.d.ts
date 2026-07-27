import { MicrogreensService } from './microgreens.service';
import { CreateMicrogreenDto } from './dto/create-microgreen.dto';
import { UpdateMicrogreenDto } from './dto/update-microgreen.dto';
export declare class MicrogreensController {
    private readonly microgreensService;
    constructor(microgreensService: MicrogreensService);
    findAll(search?: string): Promise<import("./schemas/microgreen.schema").Microgreen[]>;
    findOne(id: string): Promise<import("./schemas/microgreen.schema").Microgreen>;
    create(createMicrogreenDto: CreateMicrogreenDto): Promise<import("./schemas/microgreen.schema").Microgreen>;
    update(id: string, updateMicrogreenDto: UpdateMicrogreenDto): Promise<import("./schemas/microgreen.schema").Microgreen>;
    remove(id: string): Promise<void>;
}
