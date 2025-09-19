import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { AuditableEntity } from './AuditableEntity';
import { Pet } from './Pet';
import { User } from './User';
import { Prescription } from './Prescription';

@Entity('medical_histories')
@Index(['petId', 'visitDate'])
@Index(['veterinarianId'])
export class MedicalHistory extends AuditableEntity {
  @Column({ type: 'timestamp' })
  visitDate: Date;

  @Column({ type: 'text' })
  reasonForVisit: string;

  @Column({ type: 'text', nullable: true })
  symptoms: string;

  @Column({ type: 'text' })
  diagnosis: string;

  @Column({ type: 'text' })
  treatment: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature: number;

  @Column({ nullable: true })
  heartRate: number;

  @Column({ nullable: true })
  respiratoryRate: number;

  @Column({ type: 'text', nullable: true })
  physicalExamNotes: string;

  @Column({ type: 'text', nullable: true })
  labResults: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ type: 'text', nullable: true })
  followUpInstructions: string;

  @Column({ type: 'date', nullable: true })
  nextVisitDate: Date;

  @Column({ type: 'text', nullable: true })
  customFields: Record<string, any>;

  @Column()
  petId: string;

  @Column()
  veterinarianId: string;

  @ManyToOne(() => Pet, pet => pet.medicalHistories)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'veterinarianId' })
  veterinarian: User;

  @OneToMany(() => Prescription, prescription => prescription.medicalHistory)
  prescriptions: Prescription[];
}