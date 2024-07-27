import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from 'src/entities/notifications.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification_status } from 'src/entities/notification_status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Notification_status])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
