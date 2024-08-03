import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Noticias {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  date: Date;

  @Column()
  url: string;

  @Column({
    type: 'text',
  })
  image: string;

  @Column({
    type: 'text',
  })
  body: string;

  @Column()
  source: string;

  @Column({
    unique: true,
  })
  hash_id: string;
}
