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
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Reservation, ReservationStatus } from '@prisma/client';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { ReservationStatsDto } from './dto/reservation-stats.dto';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Create a new reservation' })
  create(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req,
  ): Promise<Reservation> {
    return this.reservationsService.create(createReservationDto, req.user.id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all reservations' })
  @ApiQuery({ name: 'status', required: false, enum: ReservationStatus })
  findAll(
    @Request() req,
    @Query('status') status?: ReservationStatus,
  ): Promise<Reservation[]> {
    return this.reservationsService.findAll(req.user.id, req.user.role, status);
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Get reservation statistics by status' })
  async getReservationStats(): Promise<ReservationStatsDto[]> {
    return this.reservationsService.getReservationStats();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get reservation by ID' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Reservation> {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a reservation' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
    @Request() req,
  ): Promise<Reservation> {
    return this.reservationsService.update(
      id,
      updateReservationDto,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('TECHNICIAN')
  @ApiOperation({ summary: 'Update reservation status (technicians only)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<Reservation> {
    return this.reservationsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a reservation' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<Reservation> {
    return this.reservationsService.remove(id, req.user.id, req.user.role);
  }
}
