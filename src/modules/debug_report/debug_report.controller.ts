import { Body, Controller, Post } from '@nestjs/common';
import { DebugReportService } from './debug_report.service';

@Controller('debug_report')
export class DebugReportController {
  constructor(private readonly debugReportService: DebugReportService) {}

  @Post('create')
  async createReport(
    @Body('module') module: string,
    @Body('error_message') error_message: string,
    @Body('error_level') error_level: string,
  ) {
    if (!module || !error_message || !error_level) {
      return {
        statusCode: 400,
        message: 'All fields are required',
      };
    }
    try {
      return this.debugReportService.createReport(
        module,
        error_message,
        error_level,
      );
    } catch {
      return {
        statusCode: 400,
        message: 'Error creating report',
      };
    }
  }
}
