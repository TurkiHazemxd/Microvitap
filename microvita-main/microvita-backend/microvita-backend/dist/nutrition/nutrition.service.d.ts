import { Model } from 'mongoose';
import { NutritionalPlan, NutritionalPlanDocument } from './schemas/nutritional-plan.schema';
import { CreateNutritionalPlanDto } from './dto/create-nutritional-plan.dto';
import { UpdateNutritionalPlanDto } from './dto/update-nutritional-plan.dto';
export declare class NutritionService {
    private nutritionalPlanModel;
    constructor(nutritionalPlanModel: Model<NutritionalPlanDocument>);
    create(createDto: CreateNutritionalPlanDto, nutritionistId: string): Promise<NutritionalPlan>;
    findAll(userId: string, userRole: string): Promise<NutritionalPlan[]>;
    findOne(id: string): Promise<NutritionalPlan>;
    findUserPlans(userId: string): Promise<NutritionalPlan[]>;
    update(id: string, updateDto: UpdateNutritionalPlanDto): Promise<NutritionalPlan>;
    assignToUser(planId: string, userId: string): Promise<NutritionalPlan>;
    remove(id: string): Promise<void>;
}
