import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { EcommerceEvent, EventType } from '../events';

type EventHandler = (event: EcommerceEvent) => Promise<void>;

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(ConsumerService.name);
  private handlers: Map<string, EventHandler[]> = new Map();

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
      
      const q = await this.channel.assertQueue('', { exclusive: true });
      await this.channel.bindQueue(q.queue, 'ecommerce_events', '#');
      
      this.channel.consume(q.queue, async (msg) => {
        if (msg) {
          try {
            const event: EcommerceEvent = JSON.parse(msg.content.toString());
            await this.handleEvent(event);
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('Error processing message', error);
            this.channel.nack(msg, false, false);
          }
        }
      });
      
      this.logger.log('Consumer connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect consumer to RabbitMQ', error);
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

  registerHandler(eventType: string, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    this.logger.log(`Registered handler for event: ${eventType}`);
  }

  private async handleEvent(event: EcommerceEvent) {
    const eventType = event.type;
    const handlers = this.handlers.get(eventType) || [];
    
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(`Error in handler for ${eventType}`, error);
      }
    }
  }
}
