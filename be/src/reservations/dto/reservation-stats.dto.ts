import { ReservationStatus } from '@prisma/client';

export class ReservationStatsDto {
  status: ReservationStatus;
  count: number;
}
