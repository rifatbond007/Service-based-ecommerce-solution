import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

@Injectable()
export class CartService implements OnModuleInit {
  private redis: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: parseInt(this.configService.get('REDIS_PORT') || '6379'),
    });
  }

  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCart(userId: string): Promise<Cart> {
    const data = await this.redis.get(this.getCartKey(userId));
    if (!data) {
      return { userId, items: [] };
    }
    return JSON.parse(data);
  }

  async addItem(userId: string, item: CartItem): Promise<Cart> {
    const cart = await this.getCart(userId);
    const existingItem = cart.items.find((i) => i.productId === item.productId);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.items.push(item);
    }

    await this.redis.set(this.getCartKey(userId), JSON.stringify(cart));
    return cart;
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter((i) => i.productId !== productId);
    await this.redis.set(this.getCartKey(userId), JSON.stringify(cart));
    return cart;
  }

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.productId === productId);

    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter((i) => i.productId !== productId);
      } else {
        item.quantity = quantity;
      }
    }

    await this.redis.set(this.getCartKey(userId), JSON.stringify(cart));
    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    await this.redis.del(this.getCartKey(userId));
  }

  async getTotal(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
