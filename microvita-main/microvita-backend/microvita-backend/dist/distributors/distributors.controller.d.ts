import { DistributorsService } from './distributors.service';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
export declare class DistributorsController {
    private readonly distributorsService;
    constructor(distributorsService: DistributorsService);
    findAll(type?: string): Promise<import("./schemas/distributor.schema").Distributor[]>;
    findOne(id: string): Promise<import("./schemas/distributor.schema").Distributor>;
    create(createDistributorDto: CreateDistributorDto): Promise<import("./schemas/distributor.schema").Distributor>;
    update(id: string, updateDistributorDto: UpdateDistributorDto): Promise<import("./schemas/distributor.schema").Distributor>;
    remove(id: string): Promise<void>;
}
