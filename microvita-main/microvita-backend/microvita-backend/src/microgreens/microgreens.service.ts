import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Microgreen, MicrogreenDocument } from './schemas/microgreen.schema';
import { CreateMicrogreenDto } from './dto/create-microgreen.dto';
import { UpdateMicrogreenDto } from './dto/update-microgreen.dto';


// Contains all business logic for microgreens operations
// Injectable means it can be injected into controllers or other services
@Injectable()
export class MicrogreensService {
  constructor(
    // Injects the Mongoose model to interact with the database
    @InjectModel(Microgreen.name) private microgreenModel: Model<MicrogreenDocument>,
  ) {}


  // Takes DTO data, generates a unique UUID, saves to database
  async create(createMicrogreenDto: CreateMicrogreenDto): Promise<Microgreen> {
    const newMicrogreen = new this.microgreenModel({
      ...createMicrogreenDto,  // Spread all fields from DTO
      id: uuidv4(),            // Generate unique ID (not MongoDB's _id)
    });
    return newMicrogreen.save();
  }

  // Returns every microgreen in the database
  async findAll(): Promise<Microgreen[]> {
    return this.microgreenModel.find().exec();
  }


  // Finds by custom 'id' field (not MongoDB _id)
  async findOne(id: string): Promise<Microgreen> {
    const microgreen = await this.microgreenModel.findOne({ id }).exec();
    if (!microgreen) {
      throw new NotFoundException(`Microgreen with id ${id} not found`);
    }
    return microgreen;
  }


  // Finds by id, updates with DTO data
  // { new: true } returns the updated document instead of the old one
  async update(id: string, updateMicrogreenDto: UpdateMicrogreenDto): Promise<Microgreen> {
    const microgreen = await this.microgreenModel.findOneAndUpdate(
      { id },
      updateMicrogreenDto,
      { new: true },  // Return the updated document
    ).exec();
    
    if (!microgreen) {
      throw new NotFoundException(`Microgreen with id ${id} not found`);
    }
    return microgreen;
  }


  // Removes by custom 'id' field
  // Throws 404 if nothing was deleted
  async remove(id: string): Promise<void> {
    const result = await this.microgreenModel.findOneAndDelete({ id }).exec();
    if (!result) {
      throw new NotFoundException(`Microgreen with id ${id} not found`);
    }
  }

  // search

  async search(searchTerm: string): Promise<Microgreen[]> {
    return this.microgreenModel.find({
      $or: [  // Match if ANY of these conditions are true
        { nom: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { bienfaits: { $regex: searchTerm, $options: 'i' } },
      ],
    }).exec();
  }
}