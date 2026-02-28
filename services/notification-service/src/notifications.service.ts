import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from '@ecommerce/common';
import { EventType, EcommerceEvent, OrderCreatedEvent, PaymentCompletedEvent, PaymentFailedEvent, ShippingCreatedEvent } from '@ecommerce/common';

export interface Notification {
  id: string;
  userId: string;
  type: 'email' | 'sms' | 'push';
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private notifications: Map<string, Notification> = new Map();

  constructor(private consumerService: ConsumerService) {}

  async onModuleInit() {
    this.consumerService.registerHandler(EventType.ORDER_CREATED, this.handleOrderCreated.bind(this));
    this.consumerService.registerHandler(EventType.PAYMENT_COMPLETED, this.handlePaymentCompleted.bind(this));
    this.consumerService.registerHandler(EventType.PAYMENT_FAILED, this.handlePaymentFailed.bind(this));
    this.consumerService.registerHandler(EventType.SHIPPING_CREATED, this.handleShippingCreated.bind(this));
    this.logger.log('Notification service initialized, registered event handlers');
  }

  private async handleOrderCreated(event: EcommerceEvent): Promise<void> {
    const orderEvent = event as OrderCreatedEvent;
    await this.sendEmail(
      orderEvent.data.userId,
      'Order Confirmation',
      `Your order ${orderEvent.data.orderId} has been received. Total: $${orderEvent.data.total}`
    );
  }

  private async handlePaymentCompleted(event: EcommerceEvent): Promise<void> {
    const paymentEvent = event as PaymentCompletedEvent;
    await this.sendEmail(
      paymentEvent.data.userId,
      'Payment Successful',
      `Your payment for order ${paymentEvent.data.orderId} is complete. Transaction: ${paymentEvent.data.transactionId}`
    );
  }

  private async handlePaymentFailed(event: EcommerceEvent): Promise<void> {
    const paymentEvent = event as PaymentFailedEvent;
    await this.sendEmail(
      paymentEvent.data.userId,
      'Payment Failed',
      `Your payment for order ${paymentEvent.data.orderId} failed. Reason: ${paymentEvent.data.reason}`
    );
  }

  private async handleShippingCreated(event: EcommerceEvent): Promise<void> {
    const shippingEvent = event as ShippingCreatedEvent;
    await this.sendEmail(
      shippingEvent.data.userId,
      'Order Shipped',
      `Your order ${shippingEvent.data.orderId} has been shipped. Tracking: ${shippingEvent.data.trackingNumber}`
    );
  }

  async sendEmail(userId: string, subject: string, message: string): Promise<Notification> {
    return this.sendNotification(userId, 'email', subject, message);
  }

  async sendSms(userId: string, message: string): Promise<Notification> {
    return this.sendNotification(userId, 'sms', 'SMS Notification', message);
  }

  async sendPush(userId: string, subject: string, message: string): Promise<Notification> {
    return this.sendNotification(userId, 'push', subject, message);
  }

  private async sendNotification(
    userId: string,
    type: 'email' | 'sms' | 'push',
    subject: string,
    message: string,
  ): Promise<Notification> {
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      userId,
      type,
      subject,
      message,
      status: 'sent',
      createdAt: new Date(),
    };

    this.notifications.set(notification.id, notification);
    this.logger.log(`[Notification] ${type} sent to user ${userId}: ${subject}`);
    return notification;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter((n) => n.userId === userId);
  }

  async findById(id: string): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
}
