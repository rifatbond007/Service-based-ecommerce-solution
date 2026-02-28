import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { EcommerceEvent } from '../events';

@Injectable()
export class PublisherService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(PublisherService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect() {
    try {
      const url = this.configService.get('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange('ecommerce_events', 'topic', { durable: true });
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  private async close() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error);
    }
  }

  async publish(event: EcommerceEvent): Promise<boolean> {
    try {
      const routingKey = event.type.toLowerCase();
      const message = Buffer.from(JSON.stringify(event));
      
      this.channel.publish(
        'ecommerce_events',
        routingKey,
        message,
        { persistent: true }
      );
      
      this.logger.log(`Published event: ${event.type} with correlationId: ${event.correlationId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to publish event: ${event.type}`, error);
      return false;
    }
  }

  generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
