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
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const question_schema_1 = require("./schemas/question.schema");
let QuestionsService = class QuestionsService {
    constructor(questionModel) {
        this.questionModel = questionModel;
    }
    async findAll() {
        return this.questionModel.find().exec();
    }
    async findOne(id) {
        const question = await this.questionModel.findOne({ id }).exec();
        if (!question) {
            throw new common_1.NotFoundException(`Question with id ${id} not found`);
        }
        return question;
    }
    async upsertQuestions(questions) {
        const results = [];
        for (const questionData of questions) {
            const result = await this.questionModel.findOneAndUpdate({ id: questionData.id }, { ...questionData }, { upsert: true, new: true }).exec();
            results.push(result);
        }
        return results;
    }
    async updateQuestion(id, updateData) {
        const updated = await this.questionModel.findOneAndUpdate({ id }, { ...updateData }, { new: true }).exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Question with id ${id} not found`);
        }
        return updated;
    }
    async resetToDefault(defaultQuestions) {
        await this.questionModel.deleteMany({}).exec();
        const results = await this.questionModel.insertMany(defaultQuestions);
        return results;
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(question_schema_1.Question.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map