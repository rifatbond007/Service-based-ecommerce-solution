import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('product/:productId')
  findByProductId(@Param('productId') productId: string) {
    return this.reviewsService.findByProductId(productId);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.reviewsService.findByUserId(userId);
  }

  @Get('product/:productId/average')
  async getAverageRating(@Param('productId') productId: string) {
    const average = await this.reviewsService.getAverageRating(productId);
    return { productId, average };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'review-service' };
  }
}
