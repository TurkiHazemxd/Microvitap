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
exports.MicrogreensController = void 0;
const common_1 = require("@nestjs/common");
const microgreens_service_1 = require("./microgreens.service");
const create_microgreen_dto_1 = require("./dto/create-microgreen.dto");
const update_microgreen_dto_1 = require("./dto/update-microgreen.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../users/schemas/user.schema");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
let MicrogreensController = class MicrogreensController {
    constructor(microgreensService) {
        this.microgreensService = microgreensService;
    }
    async findAll(search) {
        if (search) {
            return this.microgreensService.search(search);
        }
        return this.microgreensService.findAll();
    }
    async findOne(id) {
        return this.microgreensService.findOne(id);
    }
    async create(createMicrogreenDto) {
        return this.microgreensService.create(createMicrogreenDto);
    }
    async update(id, updateMicrogreenDto) {
        return this.microgreensService.update(id, updateMicrogreenDto);
    }
    async remove(id) {
        return this.microgreensService.remove(id);
    }
};
exports.MicrogreensController = MicrogreensController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MicrogreensController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MicrogreensController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.BIOLOGIST),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_microgreen_dto_1.CreateMicrogreenDto]),
    __metadata("design:returntype", Promise)
], MicrogreensController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.BIOLOGIST),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_microgreen_dto_1.UpdateMicrogreenDto]),
    __metadata("design:returntype", Promise)
], MicrogreensController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.BIOLOGIST),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MicrogreensController.prototype, "remove", null);
exports.MicrogreensController = MicrogreensController = __decorate([
    (0, common_1.Controller)('microgreens'),
    __metadata("design:paramtypes", [microgreens_service_1.MicrogreensService])
], MicrogreensController);
//# sourceMappingURL=microgreens.controller.js.map