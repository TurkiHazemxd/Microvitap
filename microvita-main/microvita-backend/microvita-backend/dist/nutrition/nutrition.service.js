"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NutritionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const nutritional_plan_schema_1 = require("./schemas/nutritional-plan.schema");
let NutritionService = class NutritionService {
    constructor(nutritionalPlanModel) {
        this.nutritionalPlanModel = nutritionalPlanModel;
    }
    async create(createDto, nutritionistId) {
        const newPlan = new this.nutritionalPlanModel({
            ...createDto,
            nutritionistId: new mongoose_2.Types.ObjectId(nutritionistId),
            status: createDto.status || 'active',
            progress: createDto.progress || 0,
        });
        return newPlan.save();
    }
    async findAll(userId, userRole) {
        if (userRole === 'consumer') {
            return this.nutritionalPlanModel
                .find({ assignedTo: new mongoose_2.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .exec();
        }
        return this.nutritionalPlanModel.find().sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const plan = await this.nutritionalPlanModel.findById(id).exec();
        if (!plan) {
            throw new common_1.NotFoundException(`Plan with id ${id} not found`);
        }
        return plan;
    }
    async findUserPlans(userId) {
        return this.nutritionalPlanModel
            .find({ assignedTo: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async update(id, updateDto) {
        const plan = await this.nutritionalPlanModel
            .findByIdAndUpdate(id, updateDto, { new: true })
            .exec();
        if (!plan) {
            throw new common_1.NotFoundException(`Plan with id ${id} not found`);
        }
        return plan;
    }
    async assignToUser(planId, userId) {
        console.log("Assigning plan:", planId, "to user:", userId);
        const plan = await this.nutritionalPlanModel
            .findByIdAndUpdate(planId, {
            assignedTo: new mongoose_2.Types.ObjectId(userId),
            status: 'active'
        }, { new: true })
            .exec();
        if (!plan) {
            throw new common_1.NotFoundException(`Plan with id ${planId} not found`);
        }
        console.log("Plan after assignment:", plan);
        return plan;
    }
    async remove(id) {
        const result = await this.nutritionalPlanModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Plan with id ${id} not found`);
        }
    }
};
exports.NutritionService = NutritionService;
exports.NutritionService = NutritionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(nutritional_plan_schema_1.NutritionalPlan.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NutritionService);
//# sourceMappingURL=nutrition.service.js.map