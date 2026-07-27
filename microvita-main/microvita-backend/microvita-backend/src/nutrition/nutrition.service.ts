import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NutritionalPlan, NutritionalPlanDocument } from './schemas/nutritional-plan.schema';
import { CreateNutritionalPlanDto } from './dto/create-nutritional-plan.dto';
import { UpdateNutritionalPlanDto } from './dto/update-nutritional-plan.dto';

@Injectable()
export class NutritionService {
  constructor(
    @InjectModel(NutritionalPlan.name) private nutritionalPlanModel: Model<NutritionalPlanDocument>,
  ) {}

  async create(createDto: CreateNutritionalPlanDto, nutritionistId: string): Promise<NutritionalPlan> {
    const newPlan = new this.nutritionalPlanModel({
      ...createDto,
      nutritionistId: new Types.ObjectId(nutritionistId),
      status: createDto.status || 'active',
      progress: createDto.progress || 0,
    });
    return newPlan.save();
  }

  // src/nutrition/nutrition.service.ts
async findAll(userId: string, userRole: string): Promise<NutritionalPlan[]> {
  // If user is a consumer, only return plans assigned to them
  if (userRole === 'consumer') {
    return this.nutritionalPlanModel
      .find({ assignedTo: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }
  
  // For nutritionists and admins, return all plans
  return this.nutritionalPlanModel.find().sort({ createdAt: -1 }).exec();
}

  async findOne(id: string): Promise<NutritionalPlan> {
    const plan = await this.nutritionalPlanModel.findById(id).exec();
    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
    return plan;
  }

  async findUserPlans(userId: string): Promise<NutritionalPlan[]> {
    return this.nutritionalPlanModel
      .find({ assignedTo: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateDto: UpdateNutritionalPlanDto): Promise<NutritionalPlan> {
    const plan = await this.nutritionalPlanModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
    return plan;
  }

  // src/nutrition/nutrition.service.ts
// src/nutrition/nutrition.service.ts
async assignToUser(planId: string, userId: string): Promise<NutritionalPlan> {
  console.log("Assigning plan:", planId, "to user:", userId);
  
  // Don't check for existing plans - allow multiple plans per user
  const plan = await this.nutritionalPlanModel
    .findByIdAndUpdate(
      planId, 
      { 
        assignedTo: new Types.ObjectId(userId),
        status: 'active'
      }, 
      { new: true }
    )
    .exec();
    
  if (!plan) {
    throw new NotFoundException(`Plan with id ${planId} not found`);
  }
  
  console.log("Plan after assignment:", plan);
  return plan;
}

  async remove(id: string): Promise<void> {
    const result = await this.nutritionalPlanModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
  }
}