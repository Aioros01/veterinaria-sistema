import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AuditableEntity } from './AuditableEntity';
import { Hospitalization } from './Hospitalization';

@Entity('hospitalization_medications')
export class HospitalizationMedication extends AuditableEntity {
  @Column()
  medicationName: string;

  @Column({ type: 'text' })
  dosage: string;

  @Column()
  frequency: string;

  @Column({ nullable: true })
  route?: string;

  @Column({ nullable: true })
  lastAdministered?: Date;

  @Column({ nullable: true })
  nextDue?: Date;

  @Column({ type: 'text', nullable: true })
  administrationLog?: any[];

  @Column({ default: true })
  isActive: boolean;

  @Column()
  hospitalizationId: string;

  @ManyToOne(() => Hospitalization, hospitalization => hospitalization.medications)
  @JoinColumn({ name: 'hospitalizationId' })
  hospitalization: Hospitalization;
}