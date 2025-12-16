import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column()
  po_number: string;

  @Column('uuid')
  supplier_id: string;

  @Column({ type: 'date', nullable: true })
  expected_delivery_date: Date;

  @Column({ default: 'draft' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
