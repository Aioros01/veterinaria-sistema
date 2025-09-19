import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AuditableEntity } from './AuditableEntity';
import { Pet } from './Pet';
import { User } from './User';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  VACCINATION = 'vaccination',
  SURGERY = 'surgery',
  GROOMING = 'grooming',
  CHECKUP = 'checkup',
  EMERGENCY = 'emergency',
  OTHER = 'other'
}

@Entity('appointments')
@Index(['appointmentDate', 'status'])
@Index(['petId'])
@Index(['veterinarianId'])
export class Appointment extends AuditableEntity {
  @Column({ type: 'timestamp' })
  appointmentDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'varchar',
    default: AppointmentType.CONSULTATION
  })
  type: AppointmentType;

  @Column({
    type: 'varchar',
    default: AppointmentStatus.SCHEDULED
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  reminderSent48h: boolean;

  @Column({ default: false })
  reminderSent24h: boolean;

  @Column({ default: false })
  reminderSent12h: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @Column({ type: 'text', nullable: true })
  customFields: Record<string, any>;

  @Column()
  petId: string;

  @Column()
  veterinarianId: string;

  @ManyToOne(() => Pet, pet => pet.appointments)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @ManyToOne(() => User, user => user.veterinarianAppointments)
  @JoinColumn({ name: 'veterinarianId' })
  veterinarian: User;

  getDuration(): number {
    const start = new Date(`2000-01-01T${this.startTime}`);
    const end = new Date(`2000-01-01T${this.endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60);
  }
}