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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("./common/decorators/public.decorator");
const fs = require("fs");
const path = require("path");
let AppController = class AppController {
    debugImages() {
        const possiblePaths = [
            path.join(__dirname, '..', 'public', 'images'),
            path.join(process.cwd(), 'public', 'images'),
            path.join(__dirname, 'public', 'images'),
        ];
        const results = possiblePaths.map(p => ({
            path: p,
            exists: fs.existsSync(p),
            files: fs.existsSync(p) ? fs.readdirSync(p).slice(0, 10) : []
        }));
        return results;
    }
    async testImage(filename, res) {
        const imagePath = path.join(process.cwd(), 'public', 'images', filename);
        if (fs.existsSync(imagePath)) {
            return res.sendFile(imagePath);
        }
        else {
            return res.status(404).send(`Image not found at: ${imagePath}`);
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('debug-images'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "debugImages", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('test-image/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "testImage", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map