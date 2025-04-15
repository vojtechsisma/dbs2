import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @ApiProperty({ description: 'Date and time of the reservation' })
  @IsDateString()
  @IsNotEmpty()
  reservationDate: string;

  @ApiProperty({ description: 'Description of the problem with the bike' })
  @IsString()
  @IsNotEmpty()
  problemDescription: string;

  @ApiProperty({ description: 'ID of the bike being serviced' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  bikeId: number;
}
