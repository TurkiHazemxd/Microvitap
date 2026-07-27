import { RecommendationsService } from './recommendations.service';
import { UpdateRecommendationStatusDto } from './dto/update-recommendation-status.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';
import { NutritionService } from '../nutrition/nutrition.service';
export declare class RecommendationsController {
    private readonly recommendationsService;
    private readonly nutritionService;
    constructor(recommendationsService: RecommendationsService, nutritionService: NutritionService);
    submitRecommendation(req: any, body: any): Promise<import("./schemas/recommendation.schema").Recommendation | {
        success: boolean;
        message: string;
        isProfileUpdate: boolean;
    }>;
    getAllRecommendations(): Promise<import("./schemas/recommendation.schema").Recommendation[]>;
    getUserRecommendations(req: any): Promise<import("./schemas/recommendation.schema").Recommendation[]>;
    getRecommendation(id: string): Promise<import("./schemas/recommendation.schema").Recommendation>;
    updateStatus(id: string, updateDto: UpdateRecommendationStatusDto): Promise<import("./schemas/recommendation.schema").Recommendation>;
    assignPlan(id: string, assignDto: AssignPlanDto, req: any): Promise<{
        success: boolean;
        message: string;
        plan: import("../nutrition/schemas/nutritional-plan.schema").NutritionalPlan;
    }>;
    deleteRecommendation(id: string): Promise<void>;
    updateRecommendationAnswers(id: string, answers: Record<string, any>, req: any): Promise<import("./schemas/recommendation.schema").Recommendation>;
}
