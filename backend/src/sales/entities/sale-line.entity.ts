import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Sale } from './sale.entity';

@Entity('sale_lines')
export class SaleLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  sale_id: string;

  @Column('uuid')
  product_id: string;

  @Column({ default: 0 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unit_price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @ManyToOne(() => Sale, (sale) => sale.lines)
  sale: Sale;
}
