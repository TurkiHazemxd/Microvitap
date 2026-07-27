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
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const public_decorator_1 = require("../common/decorators/public.decorator");
let UploadController = class UploadController {
    async uploadImage(file) {
        if (!file) {
            throw new common_1.HttpException('No file uploaded', common_1.HttpStatus.BAD_REQUEST);
        }
        return {
            success: true,
            filename: file.filename,
            path: `/images/${file.filename}`,
        };
    }
    async uploadBase64(body) {
        console.log('=== BASE64 UPLOAD RECEIVED ===');
        console.log('Filename:', body.filename);
        console.log('Base64 length:', body.base64?.length || 0);
        try {
            if (!body.base64) {
                throw new common_1.HttpException('No base64 data provided', common_1.HttpStatus.BAD_REQUEST);
            }
            let base64Data = body.base64;
            if (base64Data.includes('base64,')) {
                base64Data = base64Data.split('base64,')[1];
            }
            const buffer = Buffer.from(base64Data, 'base64');
            const uploadPath = (0, path_1.resolve)(process.cwd(), 'public', 'images');
            if (!(0, fs_1.existsSync)(uploadPath)) {
                (0, fs_1.mkdirSync)(uploadPath, { recursive: true });
            }
            const filePath = (0, path_1.resolve)(uploadPath, body.filename);
            (0, fs_1.writeFileSync)(filePath, buffer);
            console.log('File saved:', filePath);
            return {
                success: true,
                filename: body.filename,
                path: `/images/${body.filename}`,
            };
        }
        catch (error) {
            console.error('Error saving base64 image:', error);
            throw new common_1.HttpException('Failed to save image: ' + error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async listImages() {
        const imagesPath = (0, path_1.resolve)(process.cwd(), 'public', 'images');
        if ((0, fs_1.existsSync)(imagesPath)) {
            const files = (0, fs_1.readdirSync)(imagesPath);
            return {
                path: imagesPath,
                exists: true,
                images: files
            };
        }
        return {
            path: imagesPath,
            exists: false,
            images: []
        };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = (0, path_1.resolve)(process.cwd(), 'public', 'images');
                if (!(0, fs_1.existsSync)(uploadPath)) {
                    (0, fs_1.mkdirSync)(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('base64'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadBase64", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "listImages", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload')
], UploadController);
//# sourceMappingURL=upload.controller.js.map