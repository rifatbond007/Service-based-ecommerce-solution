import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsumerService } from '@ecommerce/common';
import { Review } from './entities/review.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { EventType, ShippingDeliveredEvent, EcommerceEvent } from '@ecommerce/common';

@Injectable()
export class ReviewsService implements OnModuleInit {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private consumerService: ConsumerService,
  ) {}

  async onModuleInit() {
    this.consumerService.registerHandler(EventType.SHIPPING_DELIVERED, this.handleShippingDelivered.bind(this));
    this.logger.log('Review service initialized, registered SHIPPING_DELIVERED handler');
  }

  private async handleShippingDelivered(event: EcommerceEvent): Promise<void> {
    const shippingEvent = event as ShippingDeliveredEvent;
    this.logger.log(`Order delivered: ${shippingEvent.data.orderId}, user: ${shippingEvent.data.userId}`);
    
    // In a real app, you might want to:
    // 1. Send a notification asking for review
    // 2. Store pending reviews to be submitted
    // 3. Trigger email with review link
    
    this.logger.log(`Review request queued for user ${shippingEvent.data.userId} for order ${shippingEvent.data.orderId}`);
  }

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = this.reviewsRepository.create(createReviewDto);
    return this.reviewsRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewsRepository.find();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async findByProductId(productId: string): Promise<Review[]> {
    return this.reviewsRepository.find({ where: { productId } });
  }

  async findByUserId(userId: string): Promise<Review[]> {
    return this.reviewsRepository.find({ where: { userId } });
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    Object.assign(review, updateReviewDto);
    return this.reviewsRepository.save(review);
  }

  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewsRepository.remove(review);
  }

  async getAverageRating(productId: string): Promise<number> {
    const reviews = await this.findByProductId(productId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }
}
