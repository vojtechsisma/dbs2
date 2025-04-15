import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsJSON,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateBikeDto {
  @ApiProperty({ description: 'Bike model name' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ description: 'Bike type (e.g., Mountain, Road, Gravel)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Brand ID if selecting from existing brands',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  brandId?: number;

  @ApiProperty({
    description: 'Other brand name if not selecting from existing brands',
    required: false,
  })
  @ValidateIf((o) => !o.brandId)
  @IsString()
  @IsNotEmpty()
  brandOther?: string;

  @ApiProperty({
    description:
      'Additional bike details (color, wheel size, frame size, etc.)',
    example: { color: 'Red', wheelSize: 29, frameSize: 'L', year: 2023 },
  })
  @IsOptional()
  @IsJSON()
  details?: string; // Will be converted to JSON in service
}
