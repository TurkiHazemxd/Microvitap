import { NutritionService } from './nutrition.service';
import { CreateNutritionalPlanDto } from './dto/create-nutritional-plan.dto';
import { UpdateNutritionalPlanDto } from './dto/update-nutritional-plan.dto';
export declare class NutritionController {
    private readonly nutritionService;
    constructor(nutritionService: NutritionService);
    createPlan(req: any, createDto: CreateNutritionalPlanDto): Promise<import("./schemas/nutritional-plan.schema").NutritionalPlan>;
    getAllPlans(req: any): Promise<import("./schemas/nutritional-plan.schema").NutritionalPlan[]>;
    getPlan(id: string): Promise<import("./schemas/nutritional-plan.schema").NutritionalPlan>;
    updatePlan(id: string, updateDto: UpdateNutritionalPlanDto): Promise<import("./schemas/nutritional-plan.schema").NutritionalPlan>;
    assignPlanToUser(id: string, userId: string): Promise<import("./schemas/nutritional-plan.schema").NutritionalPlan>;
    deletePlan(id: string): Promise<void>;
}
