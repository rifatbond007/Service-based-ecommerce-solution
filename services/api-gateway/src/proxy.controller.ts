import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Headers, Req, All } from '@nestjs/common';
import { ProxyService } from './proxy.service';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('api/users*')
  async handleUsers(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.path.replace('/api/users', '') || '/';
    return this.proxyService.forwardUser(path, req.method, body, headers);
  }

  @All('api/products*')
  async handleProducts(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.path.replace('/api/products', '') || '/';
    return this.proxyService.forwardProduct(path, req.method, body, headers);
  }

  @All('api/orders*')
  async handleOrders(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.path.replace('/api/orders', '') || '/';
    return this.proxyService.forwardOrder(path, req.method, body, headers);
  }

  @All('api/cart*')
  async handleCart(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.path.replace('/api/cart', '') || '/';
    return this.proxyService.forwardCart(path, req.method, body, headers);
  }

  @All('api/payments*')
  async handlePayments(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.path.replace('/api/payments', '') || '/';
    return this.proxyService.forwardPayment(path, req.method, body, headers);
  }

  @All('api/notifications*')
  async handleNotifications(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.path.replace('/api/notifications', '') || '/';
    return this.proxyService.forwardNotification(path, req.method, body, headers);
  }

  @All('api/shipping*')
  async handleShipping(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.path.replace('/api/shipping', '') || '/';
    return this.proxyService.forwardShipping(path, req.method, body, headers);
  }

  @All('api/reviews*')
  async handleReviews(@Req() req: any, @Body() body: any, @Headers() headers: any) {
    const path = req.path.replace('/api/reviews', '') || '/';
    return this.proxyService.forwardReview(path, req.method, body, headers);
  }

  @Get('health')
  async health() {
    return { status: 'ok', service: 'api-gateway' };
  }
}
