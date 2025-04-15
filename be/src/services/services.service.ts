import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Service } from '@prisma/client';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CompleteServiceDto } from './dto/complete-service.dto';
import { TechnicianStatsDto } from './dto/technician-stats.dto';
import { BikeServiceHistoryDto } from './dto/bike-service-history.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createServiceDto: CreateServiceDto,
    technicianId: number,
  ): Promise<Service> {
    const bike = await this.prisma.bike.findUnique({
      where: { id: createServiceDto.bikeId },
    });

    if (!bike) {
      throw new NotFoundException(
        `Bike with ID ${createServiceDto.bikeId} not found`,
      );
    }

    if (createServiceDto.reservationId) {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: createServiceDto.reservationId },
      });

      if (!reservation) {
        throw new NotFoundException(
          `Reservation with ID ${createServiceDto.reservationId} not found`,
        );
      }

      if (reservation.bikeId !== createServiceDto.bikeId) {
        throw new ConflictException('Reservation is for a different bike');
      }
    }

    return this.prisma.service.create({
      data: {
        serviceDate: new Date(),
        repairDescription: createServiceDto.repairDescription,
        bikeId: createServiceDto.bikeId,
        technicianId: technicianId,
        reservationId: createServiceDto.reservationId,
      },
      include: {
        bike: {
          include: { brand: true },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            login: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        reservation: true,
      },
    });
  }

  async completeService(
    completeServiceDto: CompleteServiceDto,
    technicianId: number,
  ): Promise<Service> {
    try {
      await this.prisma.$queryRaw`
        CALL complete_service(
          ${completeServiceDto.reservationId}::INTEGER, 
          ${completeServiceDto.repairDescription}, 
          ${technicianId}::INTEGER
        )
      `;

      const service = await this.prisma.service.findFirst({
        where: {
          reservationId: completeServiceDto.reservationId,
          technicianId: technicianId,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          bike: {
            include: { brand: true },
          },
          technician: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              login: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          reservation: true,
        },
      });

      return service;
    } catch (error) {
      if (error.message.includes('Reservation not found')) {
        throw new NotFoundException(
          `Reservation with ID ${completeServiceDto.reservationId} not found`,
        );
      }
      throw error;
    }
  }

  async findAll(technicianId?: number): Promise<Service[]> {
    const where = technicianId ? { technicianId } : {};

    return this.prisma.service.findMany({
      where,
      include: {
        bike: {
          include: { brand: true },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            login: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        reservation: true,
        images: true,
      },
      orderBy: { serviceDate: 'desc' },
    });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        bike: {
          include: {
            brand: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                login: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            login: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        reservation: true,
        images: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
    technicianId: number,
  ): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (service.technicianId !== technicianId) {
      throw new ConflictException(
        'You can only update your own service records',
      );
    }

    if (updateServiceDto.bikeId) {
      const bike = await this.prisma.bike.findUnique({
        where: { id: updateServiceDto.bikeId },
      });

      if (!bike) {
        throw new NotFoundException(
          `Bike with ID ${updateServiceDto.bikeId} not found`,
        );
      }
    }

    if (updateServiceDto.reservationId) {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: updateServiceDto.reservationId },
      });

      if (!reservation) {
        throw new NotFoundException(
          `Reservation with ID ${updateServiceDto.reservationId} not found`,
        );
      }

      const bikeId = updateServiceDto.bikeId || service.bikeId;
      if (reservation.bikeId !== bikeId) {
        throw new ConflictException('Reservation is for a different bike');
      }
    }

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
      include: {
        bike: {
          include: { brand: true },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            login: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        reservation: true,
      },
    });
  }

  async remove(id: number, technicianId: number): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (service.technicianId !== technicianId) {
      throw new ConflictException(
        'You can only delete your own service records',
      );
    }

    const images = await this.prisma.image.findMany({
      where: { serviceId: id },
    });

    if (images.length > 0) {
      await this.prisma.image.deleteMany({
        where: { serviceId: id },
      });
    }

    return this.prisma.service.delete({
      where: { id },
    });
  }

  async getTechnicianStats(
    technicianId: number,
  ): Promise<TechnicianStatsDto[]> {
    return this.prisma
      .$queryRaw`SELECT * FROM get_technician_service_stats(${technicianId}::INTEGER)`;
  }

  async getBikeServiceHistory(
    bikeId: number,
  ): Promise<BikeServiceHistoryDto[]> {
    return this.prisma.$queryRaw`
      SELECT * FROM "BikeServiceHistoryView" 
      WHERE bike_id = ${bikeId}
      ORDER BY service_date DESC
    `;
  }
}
