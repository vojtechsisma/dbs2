import { Module } from '@nestjs/common';
import { BikeBrandsService } from './bike-brands.service';
import { BikeBrandsController } from './bike-brands.controller';
import { PrismaModule } from 'nestjs-prisma';

@Module({
  imports: [PrismaModule],
  controllers: [BikeBrandsController],
  providers: [BikeBrandsService],
  exports: [BikeBrandsService],
})
export class BikeBrandsModule {}