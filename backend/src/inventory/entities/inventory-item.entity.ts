import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('inventory_items')
@Index(['product_id', 'location_id'], { unique: true })
@Index(['tenant_id'])
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column('uuid')
  product_id: string;

  @Column('uuid')
  location_id: string;

  @Column({ default: 0 })
  qty_available: number;

  @Column({ default: 0 })
  qty_reserved: number;

  @Column({ default: 0 })
  qty_damaged: number;

  @Column({ default: 0 })
  qty_in_transit: number;

  @Column({ nullable: true })
  bin_id: string;

  @Column({ default: 'piece' })
  uom: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_updated: Date;
}
