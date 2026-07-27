"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const express_1 = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    const publicPath = (0, path_1.join)(__dirname, '..', 'public');
    const imagesPath = (0, path_1.join)(publicPath, 'images');
    console.log('Public path:', publicPath);
    console.log('Images path:', imagesPath);
    app.useStaticAssets(publicPath, {
        prefix: '/public/',
    });
    app.useStaticAssets(imagesPath, {
        prefix: '/images/',
    });
    app.useStaticAssets(publicPath);
    app.setGlobalPrefix('api');
    const port = 3001;
    await app.listen(port);
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Test HTML: http://localhost:${port}/test.html`);
    console.log(`Test image: http://localhost:${port}/images/broc1.png`);
}
bootstrap();
//# sourceMappingURL=main.js.map