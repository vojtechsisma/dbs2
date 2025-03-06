import { ApiProperty } from '@nestjs/swagger';
import { BikeEntity } from '../../bikes/entities/bike.entity';
import { ReservationEntity } from '../../reservations/entities/reservation.entity';
import { UserEntity } from '../../users/entities/user.entity';

export class ServiceEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  serviceDate: Date;

  @ApiProperty()
  repairDescription: string;

  @ApiProperty()
  bikeId: number;

  @ApiProperty()
  technicianId: number;

  @ApiProperty({ required: false, nullable: true })
  reservationId?: number;

  @ApiProperty({ type: () => BikeEntity, required: false })
  bike?: BikeEntity;

  @ApiProperty({ type: () => UserEntity, required: false })
  technician?: UserEntity;

  @ApiProperty({ type: () => ReservationEntity, required: false })
  reservation?: ReservationEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}