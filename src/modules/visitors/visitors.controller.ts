import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { VisitorService } from './visitors.service';

@Controller('visitors')
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @Post('register')
  async register(@Body('name') name: string) {
    if (!name) {
      return {
        statusCode: 400,
        message: 'Name is required',
      };
    }
    try {
      Logger.debug(`Registering visitor: ${name}`);
      return this.visitorService.registerVisitor(name);
    } catch {
      return {
        statusCode: 400,
        message: 'Name is required',
      };
    }
  }

  @Get('total')
  async total() {
    try {
      return this.visitorService.totalVisitors();
    } catch {
      return {
        statusCode: 400,
        message: 'Something went wrong',
      };
    }
  }
}
