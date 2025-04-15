import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CompleteServiceDto {
  @ApiProperty({ description: 'ID of the reservation being serviced' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  reservationId: number;

  @ApiProperty({ description: 'Description of the repairs performed' })
  @IsString()
  @IsNotEmpty()
  repairDescription: string;
}
