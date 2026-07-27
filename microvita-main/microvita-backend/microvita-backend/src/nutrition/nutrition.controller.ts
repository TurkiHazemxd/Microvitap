import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { CreateNutritionalPlanDto } from './dto/create-nutritional-plan.dto';
import { UpdateNutritionalPlanDto } from './dto/update-nutritional-plan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('nutrition')
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('plans')
  @Roles(UserRole.NUTRITIONIST, UserRole.ADMIN)
  async createPlan(@Request() req, @Body() createDto: CreateNutritionalPlanDto) {
    const nutritionistId = req.user.userId;
    return this.nutritionService.create(createDto, nutritionistId);
  }

  // src/nutrition/nutrition.controller.ts
@Get('plans')
async getAllPlans(@Request() req) {
  const userRole = req.user.role;
  const userId = req.user.userId;
  
  return this.nutritionService.findAll(userId, userRole);
}

  @Get('plans/:id')
  async getPlan(@Param('id') id: string) {
    return this.nutritionService.findOne(id);
  }

  @Put('plans/:id')
  @Roles(UserRole.NUTRITIONIST, UserRole.ADMIN)
  async updatePlan(@Param('id') id: string, @Body() updateDto: UpdateNutritionalPlanDto) {
    return this.nutritionService.update(id, updateDto);
  }

  @Post('plans/:id/assign')
  @Roles(UserRole.NUTRITIONIST, UserRole.ADMIN)
  async assignPlanToUser(@Param('id') id: string, @Body('userId') userId: string) {
    return this.nutritionService.assignToUser(id, userId);
  }

  @Delete('plans/:id')
  @Roles(UserRole.NUTRITIONIST, UserRole.ADMIN)
  async deletePlan(@Param('id') id: string) {
    return this.nutritionService.remove(id);
  }
}