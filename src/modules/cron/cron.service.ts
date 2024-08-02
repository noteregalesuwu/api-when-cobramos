import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NewsService } from '../scrapping/news.service';

@Injectable()
export class CronService {
  constructor(private readonly newsService: NewsService) {}

  @Cron('0 */2 * * *')
  handleCron() {
    try {
      this.newsService.getInitialData();
    } catch (e) {
      Logger.error(e);
    }
  }
}
