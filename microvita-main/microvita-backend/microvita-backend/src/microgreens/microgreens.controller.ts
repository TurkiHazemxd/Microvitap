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
import { MicrogreensService } from './microgreens.service';
import { CreateMicrogreenDto } from './dto/create-microgreen.dto';
import { UpdateMicrogreenDto } from './dto/update-microgreen.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Public } from '../common/decorators/public.decorator';
import { RolesGuard } from '../common/guards/roles.guard';


// HTTP requests for /microgreens endpoints

@Controller('microgreens')
export class MicrogreensController {
  constructor(private readonly microgreensService: MicrogreensService) {}

  // get all microreens
  @Public()
  @Get()
  async findAll(@Query('search') search?: string) {
    if (search) {
      return this.microgreensService.search(search); 
    }
    return this.microgreensService.findAll();         
  }

  // gget one microgreen by ID

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.microgreensService.findOne(id);
  }

  // create new microgreen (BIOLOGIST ONLY)

  @UseGuards(JwtAuthGuard, RolesGuard)  
  @Roles(UserRole.BIOLOGIST)             
  @Post()
  async create(@Body() createMicrogreenDto: CreateMicrogreenDto) {
    return this.microgreensService.create(createMicrogreenDto);
  }

  // update microgreen (BIOLOGIST ONLY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BIOLOGIST)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMicrogreenDto: UpdateMicrogreenDto,
  ) {
    return this.microgreensService.update(id, updateMicrogreenDto);
  }

  // delete microgreen (BIOLOGIST ONLY)

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BIOLOGIST)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.microgreensService.remove(id);
  }
}