import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationStatusDto } from './dto/update-recommendation-status.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { NutritionService } from '../nutrition/nutrition.service'; // Add this import

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
    private readonly nutritionService: NutritionService, // Add this
  ) {}

  @Post('submit')
async submitRecommendation(@Request() req, @Body() body: any) {
  const userId = req.user.userId;
  const userEmail = req.user.email;
  const userName = body.userName || req.user.name || req.user.fullname || 'Utilisateur';
  
  // If it's a profile update, just update user profile without creating recommendation
  if (body.isProfileUpdate === true) {
    // Update user's stored answers without creating a demande plan
    // You can store this in user profile or just return success
    // For now, just return success without creating a recommendation
    return { 
      success: true, 
      message: 'Profile answers saved',
      isProfileUpdate: true 
    };
  }
  
  // Otherwise create a recommendation request (demande plan)
  const createDto: CreateRecommendationDto = {
    userId,
    userName,
    userEmail,
    answers: body.answers,
    status: 'pending',
  };
  
  return this.recommendationsService.create(createDto);
}

  @Get()
  @Roles(UserRole.NUTRITIONIST, UserRole.ADMIN)
  async getAllRecommendations() {
    return this.recommendationsService.findAll();
  }

  @Get('user')
  async getUserRecommendations(@Request() req) {
    const userId = req.user.userId;
    return this.recommendationsService.findByUser(userId);
  }

  @Get(':id')
  @Roles(UserRole.NUTRITIONIST, UserRole.ADMIN)
  async getRecommendation(@Param('id') id: string) {
    return this.recommendationsService.findOne(id);
  }

  @Post(':id/status')
  @Roles(UserRole.NUTRITIONIST, UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateRecommendationStatusDto,
  ) {
    return this.recommendationsService.updateStatus(id, updateDto.status, updateDto.nutritionistNotes);
  }

  @Post(':id/assign-plan')
  @Roles(UserRole.NUTRITIONIST, UserRole.ADMIN)
  async assignPlan(
    @Param('id') id: string,
    @Body() assignDto: AssignPlanDto,
    @Request() req,
  ) {
    console.log("=== ASSIGN PLAN DEBUG ===");
    console.log("Recommendation ID:", id);
    console.log("Plan ID:", assignDto.planId);
    
    // Get the recommendation to get the userId
    const recommendation = await this.recommendationsService.findOne(id);
    if (!recommendation) {
      throw new NotFoundException('Recommendation not found');
    }
    
    console.log("Consumer User ID:", recommendation.userId);
    
    // Assign the plan to the user using NutritionService
    const updatedPlan = await this.nutritionService.assignToUser(assignDto.planId, recommendation.userId.toString());
    
    console.log("Updated plan with assignedTo:", updatedPlan);
    
    // Update the recommendation status
    await this.recommendationsService.updateStatus(id, 'reviewed', `Plan assigné: ${assignDto.planId}`);
    
    return { success: true, message: 'Plan assigned successfully', plan: updatedPlan };
  }

  @Delete(':id')
  @Roles(UserRole.NUTRITIONIST, UserRole.ADMIN)
  async deleteRecommendation(@Param('id') id: string) {
    return this.recommendationsService.remove(id);
  }
   // NEW ENDPOINT
  @Put(':id/answers')
  async updateRecommendationAnswers(
    @Param('id') id: string,
    @Body('answers') answers: Record<string, any>,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const recommendation = await this.recommendationsService.findOne(id);
    
    if (!recommendation) {
      throw new NotFoundException('Recommendation not found');
    }
    
    if (recommendation.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own recommendations');
    }
    
    return this.recommendationsService.updateAnswers(id, answers);
  }
}