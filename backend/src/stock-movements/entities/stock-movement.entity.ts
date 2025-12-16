import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('stock_movements')
@Index(['tenant_id', 'created_at'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column('uuid')
  product_id: string;

  @Column('uuid', { nullable: true })
  from_location_id: string;

  @Column('uuid', { nullable: true })
  to_location_id: string;

  @Column()
  movement_type: string;

  @Column()
  quantity: number;

  @Column('uuid', { nullable: true })
  lot_id: string;

  @Column({ nullable: true })
  reason: string;

  @Column('uuid', { nullable: true })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;
}
