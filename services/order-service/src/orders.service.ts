import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { PublisherService } from '@ecommerce/common';
import { EventType, OrderCreatedEvent } from '@ecommerce/common';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private publisherService: PublisherService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const total = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = this.ordersRepository.create({
      userId: createOrderDto.userId,
      total,
      shippingAddress: createOrderDto.shippingAddress,
      status: 'pending',
    });

    const savedOrder = await this.ordersRepository.save(order);

    const orderItems = createOrderDto.items.map((item) =>
      this.orderItemsRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }),
    );

    await this.orderItemsRepository.save(orderItems);
    savedOrder.items = orderItems;

    const event: OrderCreatedEvent = {
      type: EventType.ORDER_CREATED,
      timestamp: new Date(),
      correlationId: this.publisherService.generateCorrelationId(),
      data: {
        orderId: savedOrder.id,
        userId: savedOrder.userId,
        total: savedOrder.total,
        items: savedOrder.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: savedOrder.shippingAddress,
      },
    };

    await this.publisherService.publish(event);
    this.logger.log(`Order created: ${savedOrder.id}, event published`);

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({ relations: ['items'] });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { userId },
      relations: ['items'],
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = updateStatusDto.status;
    return this.ordersRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }
}
