import { Entity, Column, OneToMany, BeforeInsert, BeforeUpdate, Index } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from './BaseEntity';
import { Pet } from './Pet';
import { Appointment } from './Appointment';

export enum UserRole {
  ADMIN = 'admin',
  VETERINARIAN = 'veterinarian',
  RECEPTIONIST = 'receptionist',
  CLIENT = 'client'
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['role'])
@Index(['documentNumber'], { unique: true })
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  documentType: string; // 'cedula' o 'pasaporte'

  @Column({ unique: true, nullable: true })
  documentNumber: string; // Número de cédula o pasaporte

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({
    type: 'varchar',
    default: UserRole.CLIENT
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  whatsappNotifications: boolean;

  @OneToMany(() => Pet, pet => pet.owner)
  pets: Pet[];

  @OneToMany(() => Appointment, appointment => appointment.veterinarian)
  veterinarianAppointments: Appointment[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}