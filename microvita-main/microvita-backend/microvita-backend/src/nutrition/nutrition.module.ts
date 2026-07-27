import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { NutritionalPlan, NutritionalPlanSchema } from './schemas/nutritional-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NutritionalPlan.name, schema: NutritionalPlanSchema },
    ]),
  ],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}