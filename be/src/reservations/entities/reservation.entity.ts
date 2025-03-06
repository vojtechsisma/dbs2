import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '@prisma/client';
import { BikeEntity } from '../../bikes/entities/bike.entity';
import { UserEntity } from '../../users/entities/user.entity';

export class ReservationEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  reservationDate: Date;

  @ApiProperty()
  problemDescription: string;

  @ApiProperty({ enum: ReservationStatus })
  status: ReservationStatus;

  @ApiProperty()
  customerId: number;

  @ApiProperty()
  bikeId: number;

  @ApiProperty({ type: () => UserEntity, required: false })
  customer?: UserEntity;

  @ApiProperty({ type: () => BikeEntity, required: false })
  bike?: BikeEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}