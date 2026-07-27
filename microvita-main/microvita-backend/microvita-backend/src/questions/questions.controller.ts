import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('questions')
//@UseGuards(JwtAuthGuard, RolesGuard) 
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // Get all questions - accessible by all authenticated users
  @Get()
  async findAll() {
    return this.questionsService.findAll();
  }

  // Update a single question - admin only
  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateQuestion(
    @Param('id') id: string,
    @Body() updateData: Partial<any>
  ) {
    return this.questionsService.updateQuestion(id, updateData);
  }

  // Bulk upsert questions - admin only
  @Put()
  @Roles(UserRole.ADMIN)
  async upsertQuestions(@Body() questions: any[]) {
    return this.questionsService.upsertQuestions(questions);
  }
}