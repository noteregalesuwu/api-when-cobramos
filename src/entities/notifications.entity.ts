import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  token: string;

  @Column()
  insert_date: Date;
}
