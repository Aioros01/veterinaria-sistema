import { Entity, Column, Index } from 'typeorm';
import { AuditableEntity } from './AuditableEntity';

export enum MedicineCategory {
  ANTIBIOTIC = 'antibiotic',
  ANALGESIC = 'analgesic',
  ANTI_INFLAMMATORY = 'anti_inflammatory',
  ANTIPARASITIC = 'antiparasitic',
  VACCINE = 'vaccine',
  VITAMIN = 'vitamin',
  SUPPLEMENT = 'supplement',
  OTHER = 'other'
}

@Entity('medicines')
@Index(['name'])
@Index(['category'])
export class Medicine extends AuditableEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  genericName: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({
    type: 'varchar',
    default: MedicineCategory.OTHER
  })
  category: MedicineCategory;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  presentation: string;

  @Column({ nullable: true })
  concentration: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ type: 'integer', default: 0 })
  currentStock: number;

  @Column({ type: 'integer', default: 10 })
  minimumStock: number;

  @Column({ type: 'integer', default: 100 })
  maximumStock: number;

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  supplierContact: string;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ nullable: true })
  batchNumber: string;

  @Column({ type: 'text', nullable: true })
  storageConditions: string;

  @Column({ type: 'text', nullable: true })
  contraindications: string;

  @Column({ type: 'text', nullable: true })
  sideEffects: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  isLowStock(): boolean {
    return this.currentStock <= this.minimumStock;
  }

  isExpiringSoon(daysThreshold: number = 30): boolean {
    if (!this.expirationDate) return false;
    const today = new Date();
    const expDate = new Date(this.expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold && diffDays > 0;
  }

  isExpired(): boolean {
    if (!this.expirationDate) return false;
    return new Date(this.expirationDate) < new Date();
  }
}