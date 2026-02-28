import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { PublisherService, ConsumerService } from '@ecommerce/common';
import { EventType, OrderCreatedEvent, PaymentCompletedEvent, PaymentFailedEvent, EcommerceEvent } from '@ecommerce/common';

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId?: string;
  createdAt: Date;
}

@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentsService.name);
  private payments: Map<string, Payment> = new Map();

  constructor(
    private publisherService: PublisherService,
    private consumerService: ConsumerService,
  ) {}

  async onModuleInit() {
    this.consumerService.registerHandler(EventType.ORDER_CREATED, this.handleOrderCreated.bind(this));
    this.logger.log('Payment service initialized, registered ORDER_CREATED handler');
  }

  private async handleOrderCreated(event: EcommerceEvent): Promise<void> {
    const orderEvent = event as OrderCreatedEvent;
    this.logger.log(`Processing ORDER_CREATED for order: ${orderEvent.data.orderId}`);
    
    try {
      await this.processPayment(
        orderEvent.data.orderId,
        orderEvent.data.userId,
        orderEvent.data.total,
        'auto',
      );
    } catch (error) {
      this.logger.error(`Failed to process payment for order: ${orderEvent.data.orderId}`, error);
    }
  }

  async processPayment(orderId: string, userId: string, amount: number, paymentMethod: string): Promise<Payment> {
    const payment: Payment = {
      id: `pay_${Date.now()}`,
      orderId,
      userId,
      amount,
      status: 'completed',
      paymentMethod,
      transactionId: `txn_${Date.now()}`,
      createdAt: new Date(),
    };

    this.payments.set(payment.id, payment);

    const completedEvent: PaymentCompletedEvent = {
      type: EventType.PAYMENT_COMPLETED,
      timestamp: new Date(),
      correlationId: this.publisherService.generateCorrelationId(),
      data: {
        orderId: payment.orderId,
        userId: payment.userId,
        amount: payment.amount,
        transactionId: payment.transactionId!,
      },
    };

    await this.publisherService.publish(completedEvent);
    this.logger.log(`Payment completed for order: ${orderId}, event published`);

    return payment;
  }

  async findById(id: string): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async findByOrderId(orderId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find((p) => p.orderId === orderId);
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter((p) => p.userId === userId);
  }

  async refund(paymentId: string): Promise<Payment> {
    const payment = await this.findById(paymentId);
    payment.status = 'failed';
    this.payments.set(payment.id, payment);

    const failedEvent: PaymentFailedEvent = {
      type: EventType.PAYMENT_FAILED,
      timestamp: new Date(),
      correlationId: this.publisherService.generateCorrelationId(),
      data: {
        orderId: payment.orderId,
        userId: payment.userId,
        reason: 'Refund requested',
      },
    };

    await this.publisherService.publish(failedEvent);
    return payment;
  }
}
