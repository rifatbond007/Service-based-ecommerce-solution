import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { PublisherService, ConsumerService } from '@ecommerce/common';
import { EventType, PaymentCompletedEvent, ShippingCreatedEvent, ShippingDeliveredEvent, EcommerceEvent } from '@ecommerce/common';

export interface Shipment {
  id: string;
  orderId: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  carrier: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ShippingService implements OnModuleInit {
  private readonly logger = new Logger(ShippingService.name);
  private shipments: Map<string, Shipment> = new Map();

  constructor(
    private publisherService: PublisherService,
    private consumerService: ConsumerService,
  ) {}

  async onModuleInit() {
    this.consumerService.registerHandler(EventType.PAYMENT_COMPLETED, this.handlePaymentCompleted.bind(this));
    this.logger.log('Shipping service initialized, registered PAYMENT_COMPLETED handler');
  }

  private async handlePaymentCompleted(event: EcommerceEvent): Promise<void> {
    const paymentEvent = event as PaymentCompletedEvent;
    this.logger.log(`Creating shipment for order: ${paymentEvent.data.orderId}`);
    
    await this.createShipment(
      paymentEvent.data.orderId,
      paymentEvent.data.userId,
      'Standard Shipping'
    );
  }

  async createShipment(orderId: string, userId: string, carrier: string): Promise<Shipment> {
    const shipment: Shipment = {
      id: `ship_${Date.now()}`,
      orderId,
      userId,
      status: 'processing',
      carrier,
      trackingNumber: `TRK${Date.now()}`,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.shipments.set(shipment.id, shipment);

    const shippingEvent: ShippingCreatedEvent = {
      type: EventType.SHIPPING_CREATED,
      timestamp: new Date(),
      correlationId: this.publisherService.generateCorrelationId(),
      data: {
        orderId: shipment.orderId,
        userId: shipment.userId,
        trackingNumber: shipment.trackingNumber!,
        carrier: shipment.carrier,
        estimatedDelivery: shipment.estimatedDelivery!,
      },
    };

    await this.publisherService.publish(shippingEvent);
    this.logger.log(`Shipment created for order: ${orderId}, event published`);

    return shipment;
  }

  async findById(id: string): Promise<Shipment> {
    const shipment = this.shipments.get(id);
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }
    return shipment;
  }

  async findByOrderId(orderId: string): Promise<Shipment | undefined> {
    return Array.from(this.shipments.values()).find((s) => s.orderId === orderId);
  }

  async updateStatus(id: string, status: Shipment['status']): Promise<Shipment> {
    const shipment = await this.findById(id);
    const previousStatus = shipment.status;
    shipment.status = status;
    shipment.updatedAt = new Date();
    this.shipments.set(shipment.id, shipment);

    if (status === 'delivered' && previousStatus !== 'delivered') {
      const deliveredEvent: ShippingDeliveredEvent = {
        type: EventType.SHIPPING_DELIVERED,
        timestamp: new Date(),
        correlationId: this.publisherService.generateCorrelationId(),
        data: {
          orderId: shipment.orderId,
          userId: shipment.userId,
          trackingNumber: shipment.trackingNumber!,
        },
      };

      await this.publisherService.publish(deliveredEvent);
      this.logger.log(`Shipment delivered for order: ${shipment.orderId}, event published`);
    }

    return shipment;
  }

  async findByUserId(userId: string): Promise<Shipment[]> {
    return Array.from(this.shipments.values()).filter((s) => s.userId === userId);
  }
}
