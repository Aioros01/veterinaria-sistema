import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { AuditableEntity } from './AuditableEntity';
import { User } from './User';
import { MedicalHistory } from './MedicalHistory';
import { Appointment } from './Appointment';
import { Vaccination } from './Vaccination';
import { Hospitalization } from './Hospitalization';
import { Consent } from './Consent';

export enum PetSpecies {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  RABBIT = 'rabbit',
  HAMSTER = 'hamster',
  GUINEA_PIG = 'guinea_pig',
  REPTILE = 'reptile',
  OTHER = 'other'
}

export enum PetGender {
  MALE = 'male',
  FEMALE = 'female'
}

@Entity('pets')
@Index(['ownerId'])
@Index(['species'])
export class Pet extends AuditableEntity {
  @Column()
  name: string;

  @Column({
    type: 'varchar',
    default: PetSpecies.OTHER
  })
  species: PetSpecies;

  @Column({ nullable: true })
  breed: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  gender: PetGender;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  microchipNumber: string;

  @Column({ default: false })
  isNeutered: boolean;

  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ type: 'text', nullable: true })
  specialConditions: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ type: 'text', nullable: true })
  customFields: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, user => user.pets)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => MedicalHistory, history => history.pet)
  medicalHistories: MedicalHistory[];

  @OneToMany(() => Appointment, appointment => appointment.pet)
  appointments: Appointment[];

  @OneToMany(() => Vaccination, vaccination => vaccination.pet)
  vaccinations: Vaccination[];

  @OneToMany(() => Hospitalization, hospitalization => hospitalization.pet)
  hospitalizations: Hospitalization[];

  @OneToMany(() => Consent, consent => consent.pet)
  consents: Consent[];

  getAge(): number | null {
    if (!this.birthDate) return null;
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}