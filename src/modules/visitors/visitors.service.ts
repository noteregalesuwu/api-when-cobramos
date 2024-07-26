import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visitor } from 'src/entities/visitor.entity';

@Injectable()
export class VisitorService {
  constructor(
    @InjectRepository(Visitor)
    private visitorRepository: Repository<Visitor>,
  ) {}

  async registerVisitor(name: string): Promise<Visitor> {
    try {
      const newVisitor = this.visitorRepository.create({
        name,
        fecha_insert: new Date(),
      });
      return this.visitorRepository.save(newVisitor);
    } catch (e) {
      Logger.error(e.message);
      return null;
    }
  }

  async totalVisitors(): Promise<{ status: number; count: number }> {
    try {
      const count = await this.visitorRepository.count();
      return {
        status: 200,
        count,
      };
    } catch (e) {
      Logger.error(e.message);
      return {
        status: 400,
        count: 0,
      };
    }
  }
}
