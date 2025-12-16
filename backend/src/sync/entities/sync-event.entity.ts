import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum SyncEventType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('sync_events')
@Index(['user_id'])
@Index(['tenant_id'])
@Index(['status'])
@Index(['created_at'])
export class SyncEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  tenant_id: string;

  @Column({
    type: 'enum',
    enum: SyncEventType,
  })
  event_type: SyncEventType;

  @Column()
  resource_type: string;

  @Column('uuid')
  resource_id: string;

  @Column('json')
  data: any;

  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  status: SyncStatus;

  @Column({ nullable: true })
  error_message: string;

  @Column({ type: 'timestamp', nullable: true })
  synced_at: Date;

  @Column({ default: 1 })
  retry_count: number;

  @CreateDateColumn()
  created_at: Date;
}
