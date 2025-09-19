import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AuditableEntity } from './AuditableEntity';
import { Hospitalization } from './Hospitalization';
import { User } from './User';

@Entity('hospitalization_notes')
export class HospitalizationNote extends AuditableEntity {
  @Column({ type: 'text' })
  note: string;

  @Column({ type: 'text', nullable: true })
  vitalSigns?: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    bloodPressure?: string;
  };

  @Column()
  hospitalizationId: string;

  @ManyToOne(() => Hospitalization, hospitalization => hospitalization.notes)
  @JoinColumn({ name: 'hospitalizationId' })
  hospitalization: Hospitalization;

  @Column()
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;
}