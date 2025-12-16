import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index(['user_id'])
@Index(['tenant_id'])
@Index(['action'])
@Index(['created_at'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  tenant_id: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  resource_type: string;

  @Column({ nullable: true })
  resource_id: string;

  @Column('json', { nullable: true })
  old_values: any;

  @Column('json', { nullable: true })
  new_values: any;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ default: false })
  success: boolean;

  @Column({ nullable: true })
  error_message: string;

  @CreateDateColumn()
  created_at: Date;
}
