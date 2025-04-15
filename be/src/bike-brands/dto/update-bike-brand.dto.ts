import { PartialType } from '@nestjs/swagger';
import { CreateBikeBrandDto } from './create-bike-brand.dto';

export class UpdateBikeBrandDto extends PartialType(CreateBikeBrandDto) {}
