import { Model } from 'mongoose';
import { Microgreen, MicrogreenDocument } from './schemas/microgreen.schema';
import { CreateMicrogreenDto } from './dto/create-microgreen.dto';
import { UpdateMicrogreenDto } from './dto/update-microgreen.dto';
export declare class MicrogreensService {
    private microgreenModel;
    constructor(microgreenModel: Model<MicrogreenDocument>);
    create(createMicrogreenDto: CreateMicrogreenDto): Promise<Microgreen>;
    findAll(): Promise<Microgreen[]>;
    findOne(id: string): Promise<Microgreen>;
    update(id: string, updateMicrogreenDto: UpdateMicrogreenDto): Promise<Microgreen>;
    remove(id: string): Promise<void>;
    search(searchTerm: string): Promise<Microgreen[]>;
}
