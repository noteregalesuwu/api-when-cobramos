import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { NewsModule } from '../scrapping/news.module';

@Module({
  providers: [CronService],
  imports: [NewsModule],
})
export class CronModule {}
