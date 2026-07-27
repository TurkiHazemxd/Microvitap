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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { Public } from '../common/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  
  @Get('profile')
  @UseGuards(JwtAuthGuard)
async getProfile(@Request() req) {
  console.log('FULL req.user =', req.user);

  const userId = req.user?.userId || req.user?.id || req.user?.sub;

  console.log('Resolved user ID:', userId);
  console.log('FULL req.user =', req.user);
  const user = await this.usersService.findById(userId);

  return {
    id: user.id,
    email: user.email,
    name: user.fullname,
    role: user.role,
    phone: user.phone || '',
    country: user.country || '',
  };
}


@Put('profile')
@UseGuards(JwtAuthGuard)
async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
  console.log('FULL req.user =', req.user);
  console.log('Update data:', updateUserDto);

  const userId = req.user?.userId || req.user?.id || req.user?.sub;

  console.log('Resolved user ID:', userId);
  console.log('FULL req.user =', req.user);
  const updatedUser = await this.usersService.update(userId, updateUserDto);

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.fullname,
    role: updatedUser.role,
    phone: updatedUser.phone || '',
    country: updatedUser.country || '',
  };
}

  @Public()
@Get()
async findAll() {
  return this.usersService.findAll();
}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}