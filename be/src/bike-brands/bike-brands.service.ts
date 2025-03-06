import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateBikeBrandDto } from './dto/create-bike-brand.dto';
import { UpdateBikeBrandDto } from './dto/update-bike-brand.dto';

@Injectable()
export class BikeBrandsService {
  constructor(private prisma: PrismaService) {}

  create(createBikeBrandDto: CreateBikeBrandDto) {
    return this.prisma.bikeBrand.create({
      data: createBikeBrandDto,
    });
  }

  findAll() {
    return this.prisma.bikeBrand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.bikeBrand.findUnique({
      where: { id },
    });
  }

  update(id: number, updateBikeBrandDto: UpdateBikeBrandDto) {
    return this.prisma.bikeBrand.update({
      where: { id },
      data: updateBikeBrandDto,
    });
  }

  remove(id: number) {
    return this.prisma.bikeBrand.delete({
      where: { id },
    });
  }
}