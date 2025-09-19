import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { AuditableEntity } from './AuditableEntity';
import { Pet } from './Pet';
import { User } from './User';
import { HospitalizationMedication } from './HospitalizationMedication';
import { HospitalizationNote } from './HospitalizationNote';

export enum DischargeType {
  MEDICAL = 'medical',        // Alta médica
  VOLUNTARY = 'voluntary',    // Alta voluntaria
  DEATH = 'death',           // Fallecimiento
  TRANSFER = 'transfer'      // Transferencia
}

@Entity('hospitalizations')
@Index(['petId', 'admissionDate'])
@Index(['isActive'])
export class Hospitalization extends AuditableEntity {
  @Column({ type: 'timestamp' })
  admissionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  dischargeDate: Date;

  @Column({ type: 'text' })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  reasonForAdmission: string;

  @Column({ type: 'text', nullable: true })
  treatmentPlan: string;

  @Column({
    type: 'varchar',
    nullable: true
  })
  dischargeType: DischargeType;

  @Column({ type: 'text', nullable: true })
  dischargeNotes: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  petId: string;

  @ManyToOne(() => Pet, pet => pet.hospitalizations)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  veterinarianId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'veterinarianId' })
  veterinarian: User;

  @OneToMany(() => HospitalizationMedication, medication => medication.hospitalization)
  medications: HospitalizationMedication[];

  @OneToMany(() => HospitalizationNote, note => note.hospitalization)
  notes: HospitalizationNote[];
}