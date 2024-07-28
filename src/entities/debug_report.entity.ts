import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Debug_report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  module: string;

  @Column()
  register_date: Date;

  @Column()
  error_message: string;

  @Column()
  error_level: string;
}
