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
    MysqlModule,
    VisitorModule,
    NotificationsModule,
    HealthModule,
    AuthModule,
    DebugReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
