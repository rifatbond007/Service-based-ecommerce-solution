import { EventType } from './event.enum';

export interface BaseEvent {
  type: EventType;
  timestamp: Date;
  correlationId: string;
}

export interface OrderCreatedEvent extends BaseEvent {
  type: EventType.ORDER_CREATED;
  data: {
    orderId: string;
    userId: string;
    total: number;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: string;
  };
}

export interface PaymentCompletedEvent extends BaseEvent {
  type: EventType.PAYMENT_COMPLETED;
  data: {
    orderId: string;
    userId: string;
    amount: number;
    transactionId: string;
  };
}

export interface PaymentFailedEvent extends BaseEvent {
  type: EventType.PAYMENT_FAILED;
  data: {
    orderId: string;
    userId: string;
    reason: string;
  };
}

export interface ShippingCreatedEvent extends BaseEvent {
  type: EventType.SHIPPING_CREATED;
  data: {
    orderId: string;
    userId: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: Date;
  };
}

export interface ShippingDeliveredEvent extends BaseEvent {
  type: EventType.SHIPPING_DELIVERED;
  data: {
    orderId: string;
    userId: string;
    trackingNumber: string;
  };
}

export interface ReviewRequestedEvent extends BaseEvent {
  type: EventType.REVIEW_REQUESTED;
  data: {
    orderId: string;
    userId: string;
    items: Array<{
      productId: string;
    }>;
  };
}

export type EcommerceEvent =
  | OrderCreatedEvent
  | PaymentCompletedEvent
  | PaymentFailedEvent
  | ShippingCreatedEvent
  | ShippingDeliveredEvent
  | ReviewRequestedEvent;
