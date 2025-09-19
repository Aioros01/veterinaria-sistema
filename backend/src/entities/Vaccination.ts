import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AuditableEntity } from './AuditableEntity';
import { Pet } from './Pet';
import { User } from './User';

@Entity('vaccinations')
@Index(['petId', 'vaccinationDate'])
@Index(['nextDoseDate'])
export class Vaccination extends AuditableEntity {
  @Column()
  vaccineName: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  batchNumber: string;

  @Column({ type: 'date' })
  vaccinationDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'date', nullable: true })
  nextDoseDate: Date;

  @Column({ nullable: true })
  doseNumber: number;

  @Column({ nullable: true })
  totalDoses: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ default: false })
  reminderSent: boolean;

  @Column()
  petId: string;

  @Column()
  veterinarianId: string;

  @ManyToOne(() => Pet, pet => pet.vaccinations)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'veterinarianId' })
  veterinarian: User;

  isUpcoming(): boolean {
    if (!this.nextDoseDate) return false;
    return new Date(this.nextDoseDate) > new Date();
  }

  daysUntilNextDose(): number | null {
    if (!this.nextDoseDate) return null;
    const today = new Date();
    const nextDose = new Date(this.nextDoseDate);
    const diffTime = nextDose.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}