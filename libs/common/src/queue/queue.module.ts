import { Module, Global } from '@nestjs/common';
import { PublisherService } from './publisher.service';
import { ConsumerService } from './consumer.service';

@Global()
@Module({
  providers: [PublisherService, ConsumerService],
  exports: [PublisherService, ConsumerService],
})
export class QueueModule {}
