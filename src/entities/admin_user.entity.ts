import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Admin_user {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  register_date: Date;
}
