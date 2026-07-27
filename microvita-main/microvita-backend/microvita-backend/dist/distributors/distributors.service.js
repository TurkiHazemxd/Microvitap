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
exports.DistributorsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const distributor_schema_1 = require("./schemas/distributor.schema");
let DistributorsService = class DistributorsService {
    constructor(distributorModel) {
        this.distributorModel = distributorModel;
    }
    async create(createDistributorDto) {
        const newDistributor = new this.distributorModel({
            ...createDistributorDto,
            id: Date.now().toString(),
        });
        return newDistributor.save();
    }
    async findAll() {
        return this.distributorModel.find().exec();
    }
    async findOne(id) {
        const distributor = await this.distributorModel.findOne({ id }).exec();
        if (!distributor) {
            throw new common_1.NotFoundException(`Distributor with id ${id} not found`);
        }
        return distributor;
    }
    async findByType(type) {
        return this.distributorModel.find({ type }).exec();
    }
    async update(id, updateDistributorDto) {
        const distributor = await this.distributorModel
            .findOneAndUpdate({ id }, updateDistributorDto, { new: true })
            .exec();
        if (!distributor) {
            throw new common_1.NotFoundException(`Distributor with id ${id} not found`);
        }
        return distributor;
    }
    async remove(id) {
        const result = await this.distributorModel.findOneAndDelete({ id }).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Distributor with id ${id} not found`);
        }
    }
};
exports.DistributorsService = DistributorsService;
exports.DistributorsService = DistributorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(distributor_schema_1.Distributor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DistributorsService);
//# sourceMappingURL=distributors.service.js.map