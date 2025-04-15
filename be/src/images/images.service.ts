import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { UserRole } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createImageDto: CreateImageDto,
    filePath: string,
    userId: number,
    role: UserRole,
  ) {
    // Check inputs - must provide either bikeId or serviceId but not both
    if (!createImageDto.bikeId && !createImageDto.serviceId) {
      throw new ConflictException(
        'Either bikeId or serviceId must be provided',
      );
    }

    if (createImageDto.bikeId && createImageDto.serviceId) {
      throw new ConflictException('Cannot provide both bikeId and serviceId');
    }

    // If bikeId provided, verify it exists and user has access
    if (createImageDto.bikeId) {
      const bike = await this.prisma.bike.findUnique({
        where: { id: createImageDto.bikeId },
      });

      if (!bike) {
        throw new NotFoundException(
          `Bike with ID ${createImageDto.bikeId} not found`,
        );
      }

      // Customers can only upload images for their own bikes
      if (role === 'CUSTOMER' && bike.ownerId !== userId) {
        throw new ConflictException(
          'You can only upload images for your own bikes',
        );
      }
    }

    // If serviceId provided, verify it exists and user has access
    if (createImageDto.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: createImageDto.serviceId },
      });

      if (!service) {
        throw new NotFoundException(
          `Service with ID ${createImageDto.serviceId} not found`,
        );
      }

      // Only the technician who performed the service can upload images for it
      if (role === 'TECHNICIAN' && service.technicianId !== userId) {
        throw new ConflictException(
          'You can only upload images for your own services',
        );
      }
    }

    return this.prisma.image.create({
      data: {
        path: filePath,
        description: createImageDto.description,
        bikeId: createImageDto.bikeId,
        serviceId: createImageDto.serviceId,
      },
      include: {
        bike: true,
        service: true,
      },
    });
  }

  async findAll(bikeId?: number, serviceId?: number) {
    const where: any = {};

    if (bikeId) {
      where.bikeId = bikeId;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    return this.prisma.image.findMany({
      where,
      include: {
        bike: true,
        service: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: {
        bike: true,
        service: true,
      },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  async update(
    id: number,
    updateImageDto: UpdateImageDto,
    userId: number,
    role: UserRole,
  ) {
    // Check if image exists
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: {
        bike: true,
        service: true,
      },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    // Check permissions
    if (role === 'CUSTOMER') {
      // Customers can only update images for their own bikes
      if (image.bikeId && image.bike?.ownerId !== userId) {
        throw new ConflictException(
          'You can only update images for your own bikes',
        );
      }

      // Customers cannot update service images
      if (image.serviceId) {
        throw new ConflictException('You cannot update service images');
      }
    } else {
      // Technician
      // Technicians can only update images for their own services
      if (image.serviceId && image.service?.technicianId !== userId) {
        throw new ConflictException(
          'You can only update images for your own services',
        );
      }
    }

    return this.prisma.image.update({
      where: { id },
      data: {
        description: updateImageDto.description,
      },
      include: {
        bike: true,
        service: true,
      },
    });
  }

  async remove(id: number, userId: number, role: UserRole) {
    // Check if image exists
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: {
        bike: true,
        service: true,
      },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    // Check permissions
    if (role === 'CUSTOMER') {
      // Customers can only delete images for their own bikes
      if (image.bikeId && image.bike?.ownerId !== userId) {
        throw new ConflictException(
          'You can only delete images for your own bikes',
        );
      }

      // Customers cannot delete service images
      if (image.serviceId) {
        throw new ConflictException('You cannot delete service images');
      }
    } else {
      // Technician
      // Technicians can only delete images for their own services
      if (image.serviceId && image.service?.technicianId !== userId) {
        throw new ConflictException(
          'You can only delete images for your own services',
        );
      }
    }

    // Remove the file
    try {
      const filePath = path.join(process.cwd(), image.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting image file:', error);
    }

    return this.prisma.image.delete({
      where: { id },
    });
  }
}
