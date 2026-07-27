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
exports.MicrogreensService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
const microgreen_schema_1 = require("./schemas/microgreen.schema");
let MicrogreensService = class MicrogreensService {
    constructor(microgreenModel) {
        this.microgreenModel = microgreenModel;
    }
    async create(createMicrogreenDto) {
        const newMicrogreen = new this.microgreenModel({
            ...createMicrogreenDto,
            id: (0, uuid_1.v4)(),
        });
        return newMicrogreen.save();
    }
    async findAll() {
        return this.microgreenModel.find().exec();
    }
    async findOne(id) {
        const microgreen = await this.microgreenModel.findOne({ id }).exec();
        if (!microgreen) {
            throw new common_1.NotFoundException(`Microgreen with id ${id} not found`);
        }
        return microgreen;
    }
    async update(id, updateMicrogreenDto) {
        const microgreen = await this.microgreenModel.findOneAndUpdate({ id }, updateMicrogreenDto, { new: true }).exec();
        if (!microgreen) {
            throw new common_1.NotFoundException(`Microgreen with id ${id} not found`);
        }
        return microgreen;
    }
    async remove(id) {
        const result = await this.microgreenModel.findOneAndDelete({ id }).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Microgreen with id ${id} not found`);
        }
    }
    async search(searchTerm) {
        return this.microgreenModel.find({
            $or: [
                { nom: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { bienfaits: { $regex: searchTerm, $options: 'i' } },
            ],
        }).exec();
    }
};
exports.MicrogreensService = MicrogreensService;
exports.MicrogreensService = MicrogreensService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(microgreen_schema_1.Microgreen.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MicrogreensService);
//# sourceMappingURL=microgreens.service.js.map