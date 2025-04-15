import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBikeBrandDto {
  @ApiProperty({ description: 'Brand name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
