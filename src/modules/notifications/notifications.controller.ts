import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigService } from '@nestjs/config';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {}

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

  @Post('send_bulk')
  async sendBulkNotification(
    @Body('title') title: string,
    @Body('body') body: string,
    @Headers('x-token-auth') token: string,
  ) {
    if (!title || !body) {
      throw new HttpException(
        'Title and body are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const SECRET_TOKEN = this.configService.get('SECRET_KEY');
      if (token !== SECRET_TOKEN) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

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
