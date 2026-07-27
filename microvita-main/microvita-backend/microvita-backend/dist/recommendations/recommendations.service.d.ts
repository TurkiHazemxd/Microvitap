import { Model } from 'mongoose';
import { Recommendation, RecommendationDocument } from './schemas/recommendation.schema';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
export declare class RecommendationsService {
    private recommendationModel;
    constructor(recommendationModel: Model<RecommendationDocument>);
    create(createDto: CreateRecommendationDto): Promise<Recommendation>;
    findAll(): Promise<Recommendation[]>;
    findOne(id: string): Promise<Recommendation>;
    findByUser(userId: string): Promise<Recommendation[]>;
    updateStatus(id: string, status: string, nutritionistNotes?: string): Promise<Recommendation>;
    assignPlan(id: string, planId: string): Promise<Recommendation>;
    remove(id: string): Promise<void>;
    updateAnswers(id: string, answers: Record<string, any>): Promise<Recommendation>;
}
