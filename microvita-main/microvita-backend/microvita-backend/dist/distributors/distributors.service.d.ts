import { Model } from 'mongoose';
import { Distributor, DistributorDocument } from './schemas/distributor.schema';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
export declare class DistributorsService {
    private distributorModel;
    constructor(distributorModel: Model<DistributorDocument>);
    create(createDistributorDto: CreateDistributorDto): Promise<Distributor>;
    findAll(): Promise<Distributor[]>;
    findOne(id: string): Promise<Distributor>;
    findByType(type: string): Promise<Distributor[]>;
    update(id: string, updateDistributorDto: UpdateDistributorDto): Promise<Distributor>;
    remove(id: string): Promise<void>;
}
