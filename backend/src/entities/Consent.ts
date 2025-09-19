import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { AuditableEntity } from './AuditableEntity';
import { Pet } from './Pet';
import { User } from './User';
import { MedicalHistory } from './MedicalHistory';
import { ConsentDocumentHistory } from './ConsentDocumentHistory';

export enum ConsentType {
  SURGERY = 'surgery',              // Consentimiento para cirugía
  ANESTHESIA = 'anesthesia',       // Consentimiento para anestesia
  EUTHANASIA = 'euthanasia',       // Consentimiento para eutanasia
  HOSPITALIZATION = 'hospitalization', // Consentimiento para hospitalización
  TREATMENT = 'treatment',         // Consentimiento para tratamiento
  OTHER = 'other'                  // Otros consentimientos
}

export enum ConsentStatus {
  PENDING = 'pending',      // Pendiente de firma
  SIGNED = 'signed',       // Firmado
  REJECTED = 'rejected',   // Rechazado
  EXPIRED = 'expired'      // Expirado
}

@Entity('consents')
@Index(['petId', 'type'])
@Index(['medicalHistoryId'])
@Index(['status'])
export class Consent extends AuditableEntity {
  @Column({
    type: 'varchar'
  })
  type: ConsentType;

  @Column({
    type: 'varchar',
    default: ConsentStatus.PENDING
  })
  status: ConsentStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  risks: string;

  @Column({ type: 'text', nullable: true })
  alternatives: string;

  @Column({ nullable: true })
  documentUrl: string; // URL del PDF del consentimiento

  @Column({ nullable: true })
  idDocumentUrl: string; // URL de la copia de cédula

  @Column({ type: 'timestamp', nullable: true })
  signedDate: Date;

  @Column({ nullable: true })
  signedBy: string; // Nombre de quien firma

  @Column({ nullable: true })
  relationship: string; // Relación con la mascota (dueño, responsable, etc.)

  @Column({ nullable: true })
  witnessName: string; // Nombre del testigo

  @Column({ type: 'text', nullable: true })
  digitalSignature: string; // Firma digital en base64

  @Column({ type: 'text', nullable: true })
  additionalNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column()
  petId: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column({ nullable: true })
  medicalHistoryId: string;

  @ManyToOne(() => MedicalHistory)
  @JoinColumn({ name: 'medicalHistoryId' })
  medicalHistory: MedicalHistory;

  @Column()
  requestedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User; // Veterinario que solicita el consentimiento

  @Column({ nullable: true })
  approvedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User; // Usuario que aprueba/firma

  @OneToMany(() => ConsentDocumentHistory, history => history.consent)
  documentHistory!: ConsentDocumentHistory[]; // Historial de documentos
}