import { ApiProperty } from '@nestjs/swagger';
import { BikeBrand } from '../../bike-brands/entities/bike-brand.entity';
import { UserEntity } from '../../users/entities/user.entity';

export class BikeEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  model: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ required: false, nullable: true })
  brandId?: number;

  @ApiProperty({ required: false, nullable: true })
  brandOther?: string;

  @ApiProperty({ required: false, nullable: true })
  details?: any;

  @ApiProperty()
  ownerId: number;

  @ApiProperty({ type: () => BikeBrand, required: false })
  brand?: BikeBrand;

  @ApiProperty({ type: () => UserEntity, required: false })
  owner?: UserEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
