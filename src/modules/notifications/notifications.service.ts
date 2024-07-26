import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notifications.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private visitorRepository: Repository<Notification>,
  ) {}
  async registerToken(
    token: string,
  ): Promise<{ status: number; message: string }> {
    if (!token) {
      return {
        status: 400,
        message: 'Token is required',
      };
    }
    try {
      const newToken = this.visitorRepository.create({
        token,
        insert_date: new Date(),
      });
      await this.visitorRepository.save(newToken);
      return {
        status: 200,
        message: 'Token registered',
      };
    } catch (e) {
      Logger.error(e.message);
      return {
        status: 400,
        message: 'Token is required',
      };
    }
  }
}
