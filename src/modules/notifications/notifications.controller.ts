import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Post('send_bulk')
  async sendBulkNotification(
    @Body('title') title: string,
    @Body('body') body: string,
  ) {
    if (!title || !body) {
      throw new HttpException(
        'Title and body are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const tokens = await this.notificationsService.getAllTokens();

      tokens.forEach((token) => {
        this.notificationsService.sendNotification(title, body, token);
      });
      return {
        statusCode: 200,
        message: `Notifications sent to ${tokens.length} devices`,
      };
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
}
