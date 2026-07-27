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
exports.RecommendationsController = void 0;
const common_1 = require("@nestjs/common");
const recommendations_service_1 = require("./recommendations.service");
const update_recommendation_status_dto_1 = require("./dto/update-recommendation-status.dto");
const assign_plan_dto_1 = require("./dto/assign-plan.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../users/schemas/user.schema");
const nutrition_service_1 = require("../nutrition/nutrition.service");
let RecommendationsController = class RecommendationsController {
    constructor(recommendationsService, nutritionService) {
        this.recommendationsService = recommendationsService;
        this.nutritionService = nutritionService;
    }
    async submitRecommendation(req, body) {
        const userId = req.user.userId;
        const userEmail = req.user.email;
        const userName = body.userName || req.user.name || req.user.fullname || 'Utilisateur';
        if (body.isProfileUpdate === true) {
            return {
                success: true,
                message: 'Profile answers saved',
                isProfileUpdate: true
            };
        }
        const createDto = {
            userId,
            userName,
            userEmail,
            answers: body.answers,
            status: 'pending',
        };
        return this.recommendationsService.create(createDto);
    }
    async getAllRecommendations() {
        return this.recommendationsService.findAll();
    }
    async getUserRecommendations(req) {
        const userId = req.user.userId;
        return this.recommendationsService.findByUser(userId);
    }
    async getRecommendation(id) {
        return this.recommendationsService.findOne(id);
    }
    async updateStatus(id, updateDto) {
        return this.recommendationsService.updateStatus(id, updateDto.status, updateDto.nutritionistNotes);
    }
    async assignPlan(id, assignDto, req) {
        console.log("=== ASSIGN PLAN DEBUG ===");
        console.log("Recommendation ID:", id);
        console.log("Plan ID:", assignDto.planId);
        const recommendation = await this.recommendationsService.findOne(id);
        if (!recommendation) {
            throw new common_1.NotFoundException('Recommendation not found');
        }
        console.log("Consumer User ID:", recommendation.userId);
        const updatedPlan = await this.nutritionService.assignToUser(assignDto.planId, recommendation.userId.toString());
        console.log("Updated plan with assignedTo:", updatedPlan);
        await this.recommendationsService.updateStatus(id, 'reviewed', `Plan assigné: ${assignDto.planId}`);
        return { success: true, message: 'Plan assigned successfully', plan: updatedPlan };
    }
    async deleteRecommendation(id) {
        return this.recommendationsService.remove(id);
    }
    async updateRecommendationAnswers(id, answers, req) {
        const userId = req.user.id;
        const recommendation = await this.recommendationsService.findOne(id);
        if (!recommendation) {
            throw new common_1.NotFoundException('Recommendation not found');
        }
        if (recommendation.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only update your own recommendations');
        }
        return this.recommendationsService.updateAnswers(id, answers);
    }
};
exports.RecommendationsController = RecommendationsController;
__decorate([
    (0, common_1.Post)('submit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "submitRecommendation", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.NUTRITIONIST, user_schema_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getAllRecommendations", null);
__decorate([
    (0, common_1.Get)('user'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getUserRecommendations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.NUTRITIONIST, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getRecommendation", null);
__decorate([
    (0, common_1.Post)(':id/status'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.NUTRITIONIST, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_recommendation_status_dto_1.UpdateRecommendationStatusDto]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/assign-plan'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.NUTRITIONIST, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_plan_dto_1.AssignPlanDto, Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "assignPlan", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.NUTRITIONIST, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "deleteRecommendation", null);
__decorate([
    (0, common_1.Put)(':id/answers'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('answers')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "updateRecommendationAnswers", null);
exports.RecommendationsController = RecommendationsController = __decorate([
    (0, common_1.Controller)('recommendations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [recommendations_service_1.RecommendationsService,
        nutrition_service_1.NutritionService])
], RecommendationsController);
//# sourceMappingURL=recommendations.controller.js.map