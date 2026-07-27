// recipes.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Public } from '../common/decorators/public.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Public()
  @Get()
  async findAll(@Query('search') search?: string) {
    if (search) {
      return this.recipesService.search(search);
    }
    return this.recipesService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  // ✅ ONLY Nutritionist can CREATE (not admin, not biologist)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NUTRITIONIST)
  @Post()
  async create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  // ✅ ONLY Nutritionist can UPDATE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NUTRITIONIST)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  // ✅ ONLY Nutritionist can DELETE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NUTRITIONIST)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.recipesService.remove(id);
  }
}