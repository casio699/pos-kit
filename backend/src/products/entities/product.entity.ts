import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('products')
@Index(['tenant_id', 'sku'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column()
  sku: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { default: {} })
  attributes: Record<string, any>;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  cost: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
