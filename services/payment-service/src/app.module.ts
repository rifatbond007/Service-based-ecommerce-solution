import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '@ecommerce/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QueueModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class AppModule {}
