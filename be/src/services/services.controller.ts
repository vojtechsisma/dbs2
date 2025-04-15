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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Service } from '@prisma/client';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CompleteServiceDto } from './dto/complete-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { TechnicianStatsDto } from './dto/technician-stats.dto';
import { BikeServiceHistoryDto } from './dto/bike-service-history.dto';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Create a new service record' })
  create(
    @Body() createServiceDto: CreateServiceDto,
    @Request() req,
  ): Promise<Service> {
    return this.servicesService.create(createServiceDto, req.user.id);
  }

  @Post('complete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Complete a service for a reservation' })
  completeService(
    @Body() completeServiceDto: CompleteServiceDto,
    @Request() req,
  ): Promise<Service> {
    return this.servicesService.completeService(
      completeServiceDto,
      req.user.id,
    );
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all service records' })
  @ApiQuery({ name: 'technicianId', required: false, type: Number })
  findAll(
    @Request() req,
    @Query('technicianId') technicianId?: string,
  ): Promise<Service[]> {
    // If user is a technician, they can filter by technicianId or get all
    // If user is a customer, they can only see services related to their bikes
    if (req.user.role === 'TECHNICIAN') {
      return this.servicesService.findAll(
        technicianId ? parseInt(technicianId) : undefined,
      );
    } else {
      // For customers, we'll filter by bikes they own in the service
      return this.servicesService.findAll();
    }
  }

  @Get('bike/:bikeId/history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get service history for a bike' })
  getBikeServiceHistory(
    @Param('bikeId', ParseIntPipe) bikeId: number,
  ): Promise<BikeServiceHistoryDto[]> {
    return this.servicesService.getBikeServiceHistory(bikeId);
  }

  @Get('technician/stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('TECHNICIAN')
  @ApiOperation({
    summary: 'Get service statistics for the current technician',
  })
  getTechnicianStats(@Request() req): Promise<TechnicianStatsDto[]> {
    return this.servicesService.getTechnicianStats(req.user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get service record by ID' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Service> {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Update a service record' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
    @Request() req,
  ): Promise<Service> {
    return this.servicesService.update(id, updateServiceDto, req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Delete a service record' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<Service> {
    return this.servicesService.remove(id, req.user.id);
  }
}
