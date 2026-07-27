// app.module.ts
// IMPORTS

// Core NestJS modules and utilities
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';

// Feature modules (each handles a specific domain)
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MicrogreensModule } from './microgreens/microgreens.module';
import { RecipesModule } from './recipes/recipes.module';
import { ChatModule } from './chat/chat.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { DistributorsModule } from './distributors/distributors.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { UploadModule } from './upload/upload.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { QuestionsModule } from './questions/questions.module';

// Everything in the app is registered here.
@Module({
  imports: [
    
    // Makes ConfigService available everywhere
    ConfigModule.forRoot({
      isGlobal: true,   // No need to import ConfigModule in other modules
      load: [configuration],  // Load custom config file
    }),
    
    // connects to MongoDB using async config (waits for ConfigService to be ready)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    
    // 100 requests per 1 minute
    ThrottlerModule.forRoot([
      {
        ttl: 60000,   // Time window in milliseconds (60 seconds)
        limit: 100,   // Max number of requests in that window
      },
    ]),
    

    // Each module handles a specific part of the application
    AuthModule,           
    UsersModule,          
    MicrogreensModule,    
    RecipesModule,    
    ChatModule,           
    NutritionModule,      
    DistributorsModule,  
    UploadModule,         
    RecommendationsModule,
    QuestionsModule,
  ],
  
  // Handles incoming HTTP requests at the root level
  controllers: [AppController],
  // Services available across the entire app
  providers: [
    {
      // This makes JwtAuthGuard apply to EVERY route by default
      // No need to add @UseGuards(JwtAuthGuard) on each controller
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}