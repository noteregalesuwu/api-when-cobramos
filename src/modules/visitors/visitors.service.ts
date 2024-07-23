import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Visitor } from './visitor.entity';
import { Visitor } from 'src/entities/visitor.entity';

@Injectable()
export class VisitorService {
  constructor(
    @InjectRepository(Visitor)
    private visitorRepository: Repository<Visitor>,
  ) {}

  async registerVisitor(name: string): Promise<Visitor> {
    const newVisitor = this.visitorRepository.create({ name });
    return this.visitorRepository.save(newVisitor);
  }

  async totalVisitors(): Promise<{ status: number; count: number }> {
    const count = await this.visitorRepository.count();
    return {
      status: 200,
      count,
    };
  }
}
