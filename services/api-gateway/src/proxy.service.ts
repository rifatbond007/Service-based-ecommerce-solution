import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ProxyService {
  private readonly userService: AxiosInstance;
  private readonly productService: AxiosInstance;
  private readonly orderService: AxiosInstance;
  private readonly cartService: AxiosInstance;
  private readonly paymentService: AxiosInstance;
  private readonly notificationService: AxiosInstance;
  private readonly shippingService: AxiosInstance;
  private readonly reviewService: AxiosInstance;

  constructor() {
    this.userService = axios.create({ baseURL: process.env.USER_SERVICE_URL || 'http://user-service:3001' });
    this.productService = axios.create({ baseURL: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002' });
    this.orderService = axios.create({ baseURL: process.env.ORDER_SERVICE_URL || 'http://order-service:3003' });
    this.cartService = axios.create({ baseURL: process.env.CART_SERVICE_URL || 'http://cart-service:3004' });
    this.paymentService = axios.create({ baseURL: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3005' });
    this.notificationService = axios.create({ baseURL: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006' });
    this.shippingService = axios.create({ baseURL: process.env.SHIPPING_SERVICE_URL || 'http://shipping-service:3007' });
    this.reviewService = axios.create({ baseURL: process.env.REVIEW_SERVICE_URL || 'http://review-service:3008' });
  }

  async forwardUser(path: string, method: string, data?: any, headers?: any) {
    return this.forward(this.userService, path, method, data, headers);
  }

  async forwardProduct(path: string, method: string, data?: any, headers?: any) {
    return this.forward(this.productService, path, method, data, headers);
  }

  async forwardOrder(path: string, method: string, data?: any, headers?: any) {
    return this.forward(this.orderService, path, method, data, headers);
  }

  async forwardCart(path: string, method: string, data?: any, headers?: any) {
    return this.forward(this.cartService, path, method, data, headers);
  }

  async forwardPayment(path: string, method: string, data?: any, headers?: any) {
    return this.forward(this.paymentService, path, method, data, headers);
  }

  async forwardNotification(path: string, method: string, data?: any, headers?: any) {
    return this.forward(this.notificationService, path, method, data, headers);
  }

  async forwardShipping(path: string, method: string, data?: any, headers?: any) {
    return this.forward(this.shippingService, path, method, data, headers);
  }

  async forwardReview(path: string, method: string, data?: any, headers?: any) {
    return this.forward(this.reviewService, path, method, data, headers);
  }

  private async forward(client: AxiosInstance, path: string, method: string, data?: any, headers?: any) {
    try {
      const config = headers ? { headers } : {};
      let response;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await client.get(path, config);
          break;
        case 'POST':
          response = await client.post(path, data, config);
          break;
        case 'PUT':
          response = await client.put(path, data, config);
          break;
        case 'PATCH':
          response = await client.patch(path, data, config);
          break;
        case 'DELETE':
          response = await client.delete(path, config);
          break;
        default:
          throw new HttpException('Method not allowed', HttpStatus.METHOD_NOT_ALLOWED);
      }
      
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
