import { ApiProperty } from '@nestjs/swagger';

export class BikeBrand {
  @ApiProperty({ description: 'Brand ID' })
  id: number;

  @ApiProperty({ description: 'Brand name' })
  name: string;
}
