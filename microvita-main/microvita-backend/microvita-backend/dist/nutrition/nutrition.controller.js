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
exports.NutritionController = void 0;
const common_1 = require("@nestjs/common");
const nutrition_service_1 = require("./nutrition.service");
const create_nutritional_plan_dto_1 = require("./dto/create-nutritional-plan.dto");
const update_nutritional_plan_dto_1 = require("./dto/update-nutritional-plan.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../users/schemas/user.schema");
let NutritionController = class NutritionController {
    constructor(nutritionService) {
        this.nutritionService = nutritionService;
    }
    async createPlan(req, createDto) {
        const nutritionistId = req.user.userId;
        return this.nutritionService.create(createDto, nutritionistId);
    }
    async getAllPlans(req) {
        const userRole = req.user.role;
        const userId = req.user.userId;
        return this.nutritionService.findAll(userId, userRole);
    }
    async getPlan(id) {
        return this.nutritionService.findOne(id);
    }
    async updatePlan(id, updateDto) {
        return this.nutritionService.update(id, updateDto);
    }
    async assignPlanToUser(id, userId) {
        return this.nutritionService.assignToUser(id, userId);
    }
    async deletePlan(id) {
        return this.nutritionService.remove(id);
    }
};
exports.NutritionController = NutritionController;
__decorate([
    (0, common_1.Post)('plans'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.NUTRITIONIST, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_nutritional_plan_dto_1.CreateNutritionalPlanDto]),
    __metadata("design:returntype", Promise)
], NutritionController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Get)('plans'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NutritionController.prototype, "getAllPlans", null);
__decorate([
    (0, common_1.Get)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NutritionController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Put)('plans/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.NUTRITIONIST, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_nutritional_plan_dto_1.UpdateNutritionalPlanDto]),
    __metadata("design:returntype", Promise)
], NutritionController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Post)('plans/:id/assign'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.NUTRITIONIST, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NutritionController.prototype, "assignPlanToUser", null);
__decorate([
    (0, common_1.Delete)('plans/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.NUTRITIONIST, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NutritionController.prototype, "deletePlan", null);
exports.NutritionController = NutritionController = __decorate([
    (0, common_1.Controller)('nutrition'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [nutrition_service_1.NutritionService])
], NutritionController);
//# sourceMappingURL=nutrition.controller.js.map