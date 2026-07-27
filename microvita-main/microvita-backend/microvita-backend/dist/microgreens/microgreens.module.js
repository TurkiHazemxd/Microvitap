"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicrogreensModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const microgreens_controller_1 = require("./microgreens.controller");
const microgreens_service_1 = require("./microgreens.service");
const microgreen_schema_1 = require("./schemas/microgreen.schema");
let MicrogreensModule = class MicrogreensModule {
};
exports.MicrogreensModule = MicrogreensModule;
exports.MicrogreensModule = MicrogreensModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: microgreen_schema_1.Microgreen.name, schema: microgreen_schema_1.MicrogreenSchema },
            ]),
        ],
        controllers: [microgreens_controller_1.MicrogreensController],
        providers: [microgreens_service_1.MicrogreensService],
        exports: [microgreens_service_1.MicrogreensService],
    })
], MicrogreensModule);
//# sourceMappingURL=microgreens.module.js.map