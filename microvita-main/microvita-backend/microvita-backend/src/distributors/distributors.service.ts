import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Distributor, DistributorDocument } from './schemas/distributor.schema';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';

@Injectable()
export class DistributorsService {
  constructor(
    @InjectModel(Distributor.name) private distributorModel: Model<DistributorDocument>,
  ) {}

  async create(createDistributorDto: CreateDistributorDto): Promise<Distributor> {
    const newDistributor = new this.distributorModel({
      ...createDistributorDto,
      id: Date.now().toString(),
    });
    return newDistributor.save();
  }

  async findAll(): Promise<Distributor[]> {
    return this.distributorModel.find().exec();
  }

  async findOne(id: string): Promise<Distributor> {
    const distributor = await this.distributorModel.findOne({ id }).exec();
    if (!distributor) {
      throw new NotFoundException(`Distributor with id ${id} not found`);
    }
    return distributor;
  }

  async findByType(type: string): Promise<Distributor[]> {
    return this.distributorModel.find({ type }).exec();
  }

  async update(id: string, updateDistributorDto: UpdateDistributorDto): Promise<Distributor> {
    const distributor = await this.distributorModel
      .findOneAndUpdate({ id }, updateDistributorDto, { new: true })
      .exec();
    if (!distributor) {
      throw new NotFoundException(`Distributor with id ${id} not found`);
    }
    return distributor;
  }

  async remove(id: string): Promise<void> {
    const result = await this.distributorModel.findOneAndDelete({ id }).exec();
    if (!result) {
      throw new NotFoundException(`Distributor with id ${id} not found`);
    }
  }
}