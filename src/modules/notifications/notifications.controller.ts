import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('register')
  async registerToken(@Body('token') token: string) {
    if (!token) {
      return {
        statusCode: 400,
        message: 'Token is required',
      };
    }
    try {
      return this.notificationsService.registerToken(token);
    } catch {
      return {
        statusCode: 400,
        message: 'Token is required',
      };
    }
  }
}
