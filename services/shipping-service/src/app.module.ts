import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '@ecommerce/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QueueModule],
  controllers: [ShippingController],
  providers: [ShippingService],
})
export class AppModule {}
