import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BikeBrandsModule } from './bike-brands/bike-brands.module';
import { BikesModule } from './bikes/bikes.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ServicesModule } from './services/services.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    BikeBrandsModule,
    BikesModule,
    ReservationsModule,
    ServicesModule,
    ImagesModule,
  ],
})
export class AppModule {}
