export class BikeNeedingServiceDto {
  id: number;
  model: string;
  type: string;
  brand_name: string;
  owner_name: string;
  days_since_last_service: number;
  last_service_date: Date;
}
