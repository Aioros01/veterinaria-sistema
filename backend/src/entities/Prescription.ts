import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AuditableEntity } from './AuditableEntity';
import { MedicalHistory } from './MedicalHistory';
import { Medicine } from './Medicine';

export enum PurchaseStatus {
  PENDING = 'pending',           // Pendiente de compra
  PURCHASED_IN_CLINIC = 'purchased_in_clinic',  // Comprado en la clínica
  PURCHASED_EXTERNAL = 'purchased_external',    // Comprado externamente
  NOT_PURCHASED = 'not_purchased'  // No comprado
}

@Entity('prescriptions')
@Index(['medicalHistoryId'])
export class Prescription extends AuditableEntity {
  @Column()
  medicineName: string;

  @Column({ type: 'text' })
  dosage: string;

  @Column()
  frequency: string;

  @Column()
  duration: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({
    type: 'varchar',
    default: PurchaseStatus.PENDING
  })
  purchaseStatus: PurchaseStatus;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({ nullable: true })
  externalPharmacy: string;  // Nombre de la farmacia externa si aplica

  @Column({ type: 'timestamp', nullable: true })
  purchaseDate: Date;

  @Column()
  medicalHistoryId: string;

  @Column({ nullable: true })
  medicineId: string;

  @ManyToOne(() => MedicalHistory, history => history.prescriptions)
  @JoinColumn({ name: 'medicalHistoryId' })
  medicalHistory: MedicalHistory;

  @ManyToOne(() => Medicine)
  @JoinColumn({ name: 'medicineId' })
  medicine: Medicine;
}