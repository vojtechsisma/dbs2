import {
  Req,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { AuthenticateddRequest } from 'src/lib/types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return new UserEntity(await this.usersService.create(createUserDto));
  }

  @Get('/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findAuthenticatd(
    @Req() request: AuthenticateddRequest,
  ): Promise<UserEntity> {
    return new UserEntity(await this.usersService.findOne(request.user.id));
  }

  @Patch('/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateSelf(
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: AuthenticateddRequest,
  ): Promise<UserEntity> {
    return new UserEntity(
      await this.usersService.update(request.user.id, updateUserDto),
    );
  }

  @Delete('/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async remove(@Req() request: AuthenticateddRequest): Promise<UserEntity> {
    return new UserEntity(await this.usersService.remove(request.user.id));
  }
}
