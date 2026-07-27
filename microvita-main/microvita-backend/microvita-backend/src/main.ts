import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { json, urlencoded } from 'express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // increase payload size limit (important for large images)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  // enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // get the absolute path to your public folder
  const publicPath = join(__dirname, '..', 'public');
  const imagesPath = join(publicPath, 'images');
  
  console.log('Public path:', publicPath);
  console.log('Images path:', imagesPath);
  
  // serve static files
  app.useStaticAssets(publicPath, {
    prefix: '/public/',
  });
  
  app.useStaticAssets(imagesPath, {
    prefix: '/images/',
  });
  
  // also serve root static files
  app.useStaticAssets(publicPath);
  
  // API prefix
  app.setGlobalPrefix('api');
  
  const port = 3001;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Test HTML: http://localhost:${port}/test.html`);
  console.log(`Test image: http://localhost:${port}/images/broc1.png`);
}
bootstrap();