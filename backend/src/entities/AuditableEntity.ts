import { Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export abstract class AuditableEntity extends BaseEntity {
  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}