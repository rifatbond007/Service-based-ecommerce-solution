import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('email')
  async sendEmail(
    @Body() body: { userId: string; subject: string; message: string },
  ) {
    return this.notificationsService.sendEmail(body.userId, body.subject, body.message);
  }

  @Post('sms')
  async sendSms(@Body() body: { userId: string; message: string }) {
    return this.notificationsService.sendSms(body.userId, body.message);
  }

  @Post('push')
  async sendPush(
    @Body() body: { userId: string; subject: string; message: string },
  ) {
    return this.notificationsService.sendPush(body.userId, body.subject, body.message);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.notificationsService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findById(id);
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'notification-service' };
  }
}
