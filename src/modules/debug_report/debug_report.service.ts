import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Debug_report } from 'src/entities/debug_report.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DebugReportService {
  constructor(
    @InjectRepository(Debug_report)
    private debugReportRepository: Repository<Debug_report>,
  ) {}
  async createReport(
    module: string,
    error_message: string,
    error_level: string,
  ) {
    try {
      const report = this.debugReportRepository.create({
        module,
        error_message,
        error_level,
        register_date: new Date(),
      });
      await this.debugReportRepository.save(report);
      return {
        status: 200,
        message: 'Report created',
      };
    } catch (e) {
      Logger.error(e.message);
      return {
        status: 400,
        message: 'Error creating report',
      };
    }
  }
}
