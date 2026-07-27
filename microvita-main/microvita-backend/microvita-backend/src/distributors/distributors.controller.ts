// distributors.controller.ts
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
import { DistributorsService } from './distributors.service';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Public } from '../common/decorators/public.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('distributors')
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) {}

  @Public()
  @Get()
  async findAll(@Query('type') type?: string) {
    if (type) {
      return this.distributorsService.findByType(type);
    }
    return this.distributorsService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.distributorsService.findOne(id);
  }

  // ✅ ONLY Distributor can CREATE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DISTRIBUTOR)
  @Post()
  async create(@Body() createDistributorDto: CreateDistributorDto) {
    return this.distributorsService.create(createDistributorDto);
  }

  // ✅ ONLY Distributor can UPDATE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DISTRIBUTOR)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDistributorDto: UpdateDistributorDto,
  ) {
    return this.distributorsService.update(id, updateDistributorDto);
  }

  // ✅ ONLY Distributor can DELETE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DISTRIBUTOR)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.distributorsService.remove(id);
  }
}