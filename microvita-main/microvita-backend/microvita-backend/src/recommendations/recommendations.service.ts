import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Recommendation, RecommendationDocument } from './schemas/recommendation.schema';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationStatusDto } from './dto/update-recommendation-status.dto';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectModel(Recommendation.name) private recommendationModel: Model<RecommendationDocument>,
  ) {}

  async create(createDto: CreateRecommendationDto): Promise<Recommendation> {
    const recommendation = new this.recommendationModel({
      userId: new Types.ObjectId(createDto.userId),
      userName: createDto.userName,
      userEmail: createDto.userEmail,
      answers: createDto.answers,
      status: createDto.status || 'pending',
    });
    return recommendation.save();
  }

  async findAll(): Promise<Recommendation[]> {
    return this.recommendationModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Recommendation> {
    const recommendation = await this.recommendationModel.findById(id).exec();
    if (!recommendation) {
      throw new NotFoundException(`Recommendation with id ${id} not found`);
    }
    return recommendation;
  }

  async findByUser(userId: string): Promise<Recommendation[]> {
    return this.recommendationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(id: string, status: string, nutritionistNotes?: string): Promise<Recommendation> {
    const updateData: any = { status };
    if (nutritionistNotes) {
      updateData.nutritionistNotes = nutritionistNotes;
      updateData.reviewedAt = new Date();
    }
    
    const recommendation = await this.recommendationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!recommendation) {
      throw new NotFoundException(`Recommendation with id ${id} not found`);
    }
    return recommendation;
  }

  async assignPlan(id: string, planId: string): Promise<Recommendation> {
    const recommendation = await this.recommendationModel
      .findByIdAndUpdate(
        id, 
        { 
          assignedPlanId: new Types.ObjectId(planId),
          status: 'reviewed',
          reviewedAt: new Date()
        }, 
        { new: true }
      )
      .exec();
    
    if (!recommendation) {
      throw new NotFoundException(`Recommendation with id ${id} not found`);
    }
    return recommendation;
  }

  async remove(id: string): Promise<void> {
    const result = await this.recommendationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Recommendation with id ${id} not found`);
    }
  }
  // Add this method - updates only answers, keeps status unchanged
  async updateAnswers(id: string, answers: Record<string, any>): Promise<Recommendation> {
    const updatedRecommendation = await this.recommendationModel
      .findByIdAndUpdate(
        id,
        { 
          answers: answers,
          // Don't change status, createdAt, or other fields
        },
        { new: true } // Return the updated document
      )
      .exec();
    
    if (!updatedRecommendation) {
      throw new NotFoundException(`Recommendation with id ${id} not found`);
    }
    
    return updatedRecommendation;
  }
}
