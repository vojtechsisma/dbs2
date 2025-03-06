import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CompleteServiceDto } from './dto/complete-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto, technicianId: number) {
    // Check if bike exists
    const bike = await this.prisma.bike.findUnique({
      where: { id: createServiceDto.bikeId }
    });

    if (!bike) {
      throw new NotFoundException(`Bike with ID ${createServiceDto.bikeId} not found`);
    }

    // Check if reservation exists if provided
    if (createServiceDto.reservationId) {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: createServiceDto.reservationId }
      });

      if (!reservation) {
        throw new NotFoundException(`Reservation with ID ${createServiceDto.reservationId} not found`);
      }

      // Check if reservation matches the bike
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
        reservationId: createServiceDto.reservationId
      },
      include: {
        bike: {
          include: { brand: true }
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
            updatedAt: true
          }
        },
        reservation: true
      }
    });
  }

  async completeService(completeServiceDto: CompleteServiceDto, technicianId: number) {
    // Call the stored procedure to complete a service
    try {
      await this.prisma.$queryRaw`
        CALL complete_service(
          ${completeServiceDto.reservationId}, 
          ${completeServiceDto.repairDescription}, 
          ${technicianId}
        )
      `;

      // Find the newly created service
      const service = await this.prisma.service.findFirst({
        where: { 
          reservationId: completeServiceDto.reservationId,
          technicianId: technicianId
        },
        orderBy: { createdAt: 'desc' },
        include: {
          bike: {
            include: { brand: true }
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
              updatedAt: true
            }
          },
          reservation: true
        }
      });

      return service;
    } catch (error) {
      if (error.message.includes('Reservation not found')) {
        throw new NotFoundException(`Reservation with ID ${completeServiceDto.reservationId} not found`);
      }
      throw error;
    }
  }

  async findAll(technicianId?: number) {
    const where = technicianId ? { technicianId } : {};
    
    return this.prisma.service.findMany({
      where,
      include: {
        bike: {
          include: { brand: true }
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
            updatedAt: true
          }
        },
        reservation: true,
        images: true
      },
      orderBy: { serviceDate: 'desc' }
    });
  }

  async findOne(id: number) {
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
                updatedAt: true
              }
            }
          }
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
            updatedAt: true
          }
        },
        reservation: true,
        images: true
      }
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto, technicianId: number) {
    // First check if the service exists and belongs to the technician
    const service = await this.prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (service.technicianId !== technicianId) {
      throw new ConflictException('You can only update your own service records');
    }

    // Check if bike exists if provided
    if (updateServiceDto.bikeId) {
      const bike = await this.prisma.bike.findUnique({
        where: { id: updateServiceDto.bikeId }
      });

      if (!bike) {
        throw new NotFoundException(`Bike with ID ${updateServiceDto.bikeId} not found`);
      }
    }

    // Check if reservation exists if provided
    if (updateServiceDto.reservationId) {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: updateServiceDto.reservationId }
      });

      if (!reservation) {
        throw new NotFoundException(`Reservation with ID ${updateServiceDto.reservationId} not found`);
      }

      // Check if reservation matches the bike
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
          include: { brand: true }
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
            updatedAt: true
          }
        },
        reservation: true
      }
    });
  }

  async remove(id: number, technicianId: number) {
    // First check if the service exists and belongs to the technician
    const service = await this.prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (service.technicianId !== technicianId) {
      throw new ConflictException('You can only delete your own service records');
    }

    // Check if there are any images associated with this service
    const images = await this.prisma.image.findMany({
      where: { serviceId: id }
    });

    if (images.length > 0) {
      // Delete the associated images first
      await this.prisma.image.deleteMany({
        where: { serviceId: id }
      });
    }

    return this.prisma.service.delete({
      where: { id }
    });
  }

  // Get service statistics for a technician
  async getTechnicianStats(technicianId: number) {
    return this.prisma.$queryRaw`SELECT * FROM get_technician_service_stats(${technicianId})`;
  }

  // Get service history for a bike
  async getBikeServiceHistory(bikeId: number) {
    return this.prisma.$queryRaw`
      SELECT * FROM "BikeServiceHistoryView" 
      WHERE bike_id = ${bikeId}
      ORDER BY service_date DESC
    `;
  }
}