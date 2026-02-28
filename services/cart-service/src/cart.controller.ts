import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService, CartItem } from './cart.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async getCart(@Param('userId') userId: string, @Request() req: any) {
    return this.cartService.getCart(req.user.sub);
  }

  @Post(':userId/items')
  @UseGuards(JwtAuthGuard)
  async addItem(@Param('userId') userId: string, @Body() item: CartItem, @Request() req: any) {
    return this.cartService.addItem(req.user.sub, item);
  }

  @Put(':userId/items/:productId')
  @UseGuards(JwtAuthGuard)
  async updateQuantity(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
    @Request() req: any,
  ) {
    return this.cartService.updateQuantity(req.user.sub, productId, quantity);
  }

  @Delete(':userId/items/:productId')
  @UseGuards(JwtAuthGuard)
  async removeItem(@Param('userId') userId: string, @Param('productId') productId: string, @Request() req: any) {
    return this.cartService.removeItem(req.user.sub, productId);
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  async clearCart(@Param('userId') userId: string, @Request() req: any) {
    await this.cartService.clearCart(req.user.sub);
    return { message: 'Cart cleared' };
  }

  @Get(':userId/total')
  @UseGuards(JwtAuthGuard)
  async getTotal(@Param('userId') userId: string, @Request() req: any) {
    const total = await this.cartService.getTotal(req.user.sub);
    return { total };
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'cart-service' };
  }
}
