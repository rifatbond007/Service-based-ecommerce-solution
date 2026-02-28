import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '@ecommerce/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QueueModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class AppModule {}
