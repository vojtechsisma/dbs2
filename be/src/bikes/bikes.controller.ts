import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Query, 
  ParseIntPipe 
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BikesService } from './bikes.service';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Bikes')
@Controller('bikes')
export class BikesController {
  constructor(private readonly bikesService: BikesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new bike' })
  create(@Body() createBikeDto: CreateBikeDto, @Request() req) {
    return this.bikesService.create(createBikeDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bikes or filter by owner' })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  findAll(@Query('userId') userId?: string) {
    return this.bikesService.findAll(userId ? parseInt(userId) : undefined);
  }

  @Get('needing-service')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Get bikes that need servicing' })
  findBikesNeedingService() {
    return this.bikesService.findBikesNeedingService();
  }

  @Get('count-by-type/:type')
  @ApiOperation({ summary: 'Count bikes by type' })
  countByType(@Param('type') type: string) {
    return this.bikesService.countByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bike by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bikesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a bike' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateBikeDto: UpdateBikeDto,
    @Request() req
  ) {
    // Customers can only update their own bikes, technicians can update any
    const isCustomer = req.user.role === 'CUSTOMER';
    return this.bikesService.update(
      id, 
      updateBikeDto, 
      isCustomer ? req.user.id : undefined
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a bike' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Customers can only delete their own bikes, technicians can delete any
    const isCustomer = req.user.role === 'CUSTOMER';
    return this.bikesService.remove(
      id, 
      isCustomer ? req.user.id : undefined
    );
  }
}