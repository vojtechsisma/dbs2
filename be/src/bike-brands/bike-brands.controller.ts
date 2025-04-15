import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BikeBrandsService } from './bike-brands.service';
import { CreateBikeBrandDto } from './dto/create-bike-brand.dto';
import { UpdateBikeBrandDto } from './dto/update-bike-brand.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Bike Brands')
@Controller('bike-brands')
export class BikeBrandsController {
  constructor(private readonly bikeBrandsService: BikeBrandsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Create a new bike brand' })
  create(@Body() createBikeBrandDto: CreateBikeBrandDto) {
    return this.bikeBrandsService.create(createBikeBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bike brands' })
  findAll() {
    return this.bikeBrandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bike brand by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bikeBrandsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Update a bike brand' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBikeBrandDto: UpdateBikeBrandDto,
  ) {
    return this.bikeBrandsService.update(id, updateBikeBrandDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Delete a bike brand' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bikeBrandsService.remove(id);
  }
}
