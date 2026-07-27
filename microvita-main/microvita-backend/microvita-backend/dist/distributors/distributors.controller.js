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
exports.DistributorsController = void 0;
const common_1 = require("@nestjs/common");
const distributors_service_1 = require("./distributors.service");
const create_distributor_dto_1 = require("./dto/create-distributor.dto");
const update_distributor_dto_1 = require("./dto/update-distributor.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../users/schemas/user.schema");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
let DistributorsController = class DistributorsController {
    constructor(distributorsService) {
        this.distributorsService = distributorsService;
    }
    async findAll(type) {
        if (type) {
            return this.distributorsService.findByType(type);
        }
        return this.distributorsService.findAll();
    }
    async findOne(id) {
        return this.distributorsService.findOne(id);
    }
    async create(createDistributorDto) {
        return this.distributorsService.create(createDistributorDto);
    }
    async update(id, updateDistributorDto) {
        return this.distributorsService.update(id, updateDistributorDto);
    }
    async remove(id) {
        return this.distributorsService.remove(id);
    }
};
exports.DistributorsController = DistributorsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DistributorsController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DistributorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DISTRIBUTOR),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_distributor_dto_1.CreateDistributorDto]),
    __metadata("design:returntype", Promise)
], DistributorsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DISTRIBUTOR),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_distributor_dto_1.UpdateDistributorDto]),
    __metadata("design:returntype", Promise)
], DistributorsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DISTRIBUTOR),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DistributorsController.prototype, "remove", null);
exports.DistributorsController = DistributorsController = __decorate([
    (0, common_1.Controller)('distributors'),
    __metadata("design:paramtypes", [distributors_service_1.DistributorsService])
], DistributorsController);
//# sourceMappingURL=distributors.controller.js.map