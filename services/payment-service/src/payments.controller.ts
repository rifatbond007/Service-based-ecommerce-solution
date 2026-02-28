import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async processPayment(
    @Body() body: { orderId: string; amount: number; paymentMethod: string },
    @Request() req: any,
  ) {
    return this.paymentsService.processPayment(
      body.orderId,
      req.user.sub,
      body.amount,
      body.paymentMethod,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  findByOrderId(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUserId(@Param('userId') userId: string, @Request() req: any) {
    return this.paymentsService.findByUserId(req.user.sub);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  refund(@Param('id') id: string) {
    return this.paymentsService.refund(id);
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'payment-service' };
  }
}
