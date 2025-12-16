import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { SaleLine } from './sale-line.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column('uuid')
  location_id: string;

  @Column('uuid', { nullable: true })
  user_id: string;

  @Column('decimal', { precision: 12, scale: 2 })
  total_amount: number;

  @Column({ default: 'card' })
  payment_method: string;

  @Column({ default: 'completed' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => SaleLine, (line) => line.sale)
  lines: SaleLine[];
}
