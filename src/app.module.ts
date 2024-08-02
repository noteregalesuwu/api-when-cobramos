import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VisitorModule } from './modules/visitors/visitors.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { MysqlModule } from './modules/database/mysql.module';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { DebugReportModule } from './modules/debug_report/debug_report.module';
import { NewsModule } from './modules/scrapping/news.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './modules/cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
    MysqlModule,
    VisitorModule,
    NotificationsModule,
    HealthModule,
    AuthModule,
    DebugReportModule,
    NewsModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
