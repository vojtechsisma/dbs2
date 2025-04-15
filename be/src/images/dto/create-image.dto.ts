import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateImageDto {
  @ApiProperty({
    description: 'ID of the bike (required if serviceId not provided)',
    required: false,
  })
  @ValidateIf((o) => !o.serviceId)
  @IsInt()
  @Type(() => Number)
  bikeId?: number;

  @ApiProperty({
    description: 'ID of the service (required if bikeId not provided)',
    required: false,
  })
  @ValidateIf((o) => !o.bikeId)
  @IsInt()
  @Type(() => Number)
  serviceId?: number;

  @ApiProperty({ description: 'Description of the image', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
