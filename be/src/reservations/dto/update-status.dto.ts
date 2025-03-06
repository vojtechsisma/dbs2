import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReservationStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ 
    description: 'New status of the reservation', 
    enum: ReservationStatus 
  })
  @IsEnum(ReservationStatus)
  @IsNotEmpty()
  status: ReservationStatus;
}