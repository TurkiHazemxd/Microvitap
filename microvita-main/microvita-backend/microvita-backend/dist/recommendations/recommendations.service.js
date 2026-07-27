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
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const recommendation_schema_1 = require("./schemas/recommendation.schema");
let RecommendationsService = class RecommendationsService {
    constructor(recommendationModel) {
        this.recommendationModel = recommendationModel;
    }
    async create(createDto) {
        const recommendation = new this.recommendationModel({
            userId: new mongoose_2.Types.ObjectId(createDto.userId),
            userName: createDto.userName,
            userEmail: createDto.userEmail,
            answers: createDto.answers,
            status: createDto.status || 'pending',
        });
        return recommendation.save();
    }
    async findAll() {
        return this.recommendationModel.find().sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const recommendation = await this.recommendationModel.findById(id).exec();
        if (!recommendation) {
            throw new common_1.NotFoundException(`Recommendation with id ${id} not found`);
        }
        return recommendation;
    }
    async findByUser(userId) {
        return this.recommendationModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async updateStatus(id, status, nutritionistNotes) {
        const updateData = { status };
        if (nutritionistNotes) {
            updateData.nutritionistNotes = nutritionistNotes;
            updateData.reviewedAt = new Date();
        }
        const recommendation = await this.recommendationModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        if (!recommendation) {
            throw new common_1.NotFoundException(`Recommendation with id ${id} not found`);
        }
        return recommendation;
    }
    async assignPlan(id, planId) {
        const recommendation = await this.recommendationModel
            .findByIdAndUpdate(id, {
            assignedPlanId: new mongoose_2.Types.ObjectId(planId),
            status: 'reviewed',
            reviewedAt: new Date()
        }, { new: true })
            .exec();
        if (!recommendation) {
            throw new common_1.NotFoundException(`Recommendation with id ${id} not found`);
        }
        return recommendation;
    }
    async remove(id) {
        const result = await this.recommendationModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Recommendation with id ${id} not found`);
        }
    }
    async updateAnswers(id, answers) {
        const updatedRecommendation = await this.recommendationModel
            .findByIdAndUpdate(id, {
            answers: answers,
        }, { new: true })
            .exec();
        if (!updatedRecommendation) {
            throw new common_1.NotFoundException(`Recommendation with id ${id} not found`);
        }
        return updatedRecommendation;
    }
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(recommendation_schema_1.Recommendation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map