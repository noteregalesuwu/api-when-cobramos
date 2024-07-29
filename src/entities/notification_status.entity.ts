import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Notification_status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  fecha_envio: Date;

  @Column()
  envio_status: string;

  @Column({
    type: 'text',
  })
  response: string;
}
