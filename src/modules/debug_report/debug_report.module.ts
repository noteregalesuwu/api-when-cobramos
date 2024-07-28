import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debug_report } from 'src/entities/debug_report.entity';
import { DebugReportService } from './debug_report.service';
import { DebugReportController } from './debug_report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Debug_report])],
  providers: [DebugReportService],
  controllers: [DebugReportController],
})
export class DebugReportModule {}
