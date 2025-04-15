import { ApiProperty } from '@nestjs/swagger';
import { BikeEntity } from '../../bikes/entities/bike.entity';
import { ServiceEntity } from '../../services/entities/service.entity';

export class ImageEntity {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false, nullable: true })
  bikeId?: number;

  @ApiProperty({ required: false, nullable: true })
  serviceId?: number;

  @ApiProperty()
  path: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string;

  @ApiProperty({ type: () => BikeEntity, required: false })
  bike?: BikeEntity;

  @ApiProperty({ type: () => ServiceEntity, required: false })
  service?: ServiceEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
