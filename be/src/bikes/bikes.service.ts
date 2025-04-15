import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Bike } from '@prisma/client';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { BikeNeedingServiceDto } from './dto/bike-needing-service.dto';

@Injectable()
export class BikesService {
  constructor(private prisma: PrismaService) {}

  async create(createBikeDto: CreateBikeDto, userId: number): Promise<Bike> {
    const details = createBikeDto.details
      ? JSON.parse(createBikeDto.details)
      : undefined;

    return this.prisma.bike.create({
      data: {
        model: createBikeDto.model,
        type: createBikeDto.type,
        brandId: createBikeDto.brandId,
        brandOther: createBikeDto.brandOther,
        details,
        ownerId: userId,
      },
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
    });
  }

  async findAll(userId?: number): Promise<Bike[]> {
    const where = userId ? { ownerId: userId } : {};

    return this.prisma.bike.findMany({
      where,
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
        images: {
          select: {
            id: true,
            path: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Bike> {
    const bike = await this.prisma.bike.findUnique({
      where: { id },
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
        images: {
          select: {
            id: true,
            path: true,
            description: true,
          },
        },
        services: {
          include: {
            technician: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { serviceDate: 'desc' },
        },
      },
    });

    if (!bike) {
      throw new NotFoundException(`Bike with ID ${id} not found`);
    }

    return bike;
  }

  async update(
    id: number,
    updateBikeDto: UpdateBikeDto,
    userId?: number,
  ): Promise<Bike> {
    const bike = await this.prisma.bike.findUnique({
      where: { id },
    });

    if (!bike) {
      throw new NotFoundException(`Bike with ID ${id} not found`);
    }

    if (userId && bike.ownerId !== userId) {
      throw new ConflictException('You can only update your own bikes');
    }

    const details = updateBikeDto.details
      ? JSON.parse(updateBikeDto.details)
      : undefined;
    const data: any = { ...updateBikeDto };

    if (details) {
      data.details = details;
    }

    return this.prisma.bike.update({
      where: { id },
      data,
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
    });
  }

  async remove(id: number, userId?: number): Promise<Bike> {
    const bike = await this.prisma.bike.findUnique({
      where: { id },
    });

    if (!bike) {
      throw new NotFoundException(`Bike with ID ${id} not found`);
    }

    if (userId && bike.ownerId !== userId) {
      throw new ConflictException('You can only delete your own bikes');
    }

    const reservations = await this.prisma.reservation.findMany({
      where: { bikeId: id },
    });

    if (reservations.length > 0) {
      throw new ConflictException(
        'Cannot delete a bike with existing reservations',
      );
    }

    return this.prisma.bike.delete({
      where: { id },
    });
  }

  async countByType(type: string): Promise<number> {
    const result = await this.prisma
      .$queryRaw`SELECT count_bikes_by_type(${type})`;
    return result[0].count_bikes_by_type;
  }

  async findBikesNeedingService(): Promise<BikeNeedingServiceDto[]> {
    return this.prisma.$queryRaw`SELECT * FROM find_bikes_needing_service()`;
  }
}
