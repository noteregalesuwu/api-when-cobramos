import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitorService } from './visitors.service';
import { VisitorController } from './visitors.controller';
import { Visitor } from 'src/entities/visitor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visitor])],
  providers: [VisitorService],
  controllers: [VisitorController],
})
export class VisitorModule {}
