import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ description: 'Description of the repairs performed' })
  @IsString()
  @IsNotEmpty()
  repairDescription: string;

  @ApiProperty({ description: 'ID of the bike being serviced' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  bikeId: number;

  @ApiProperty({ description: 'ID of the reservation if this service is linked to one', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  reservationId?: number;
}