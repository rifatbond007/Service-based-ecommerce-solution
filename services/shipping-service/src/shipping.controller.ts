import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  async createShipment(
    @Body() body: { orderId: string; userId: string; carrier: string },
  ) {
    return this.shippingService.createShipment(body.orderId, body.userId, body.carrier);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shippingService.findById(id);
  }

  @Get('order/:orderId')
  findByOrderId(@Param('orderId') orderId: string) {
    return this.shippingService.findByOrderId(orderId);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.shippingService.findByUserId(userId);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  ) {
    return this.shippingService.updateStatus(id, status);
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'shipping-service' };
  }
}
