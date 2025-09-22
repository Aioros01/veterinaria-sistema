import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Consent } from './Consent';
import { User } from './User';

export enum DocumentType {
  SIGNED_CONSENT = 'signed_consent',
  ID_DOCUMENT = 'id_document'
}

@Entity('consent_document_history')
export class ConsentDocumentHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  consentId!: string;

  @ManyToOne(() => Consent, consent => consent.documentHistory)
  @JoinColumn({ name: 'consentId' })
  consent!: Consent;

  @Column({
    type: 'enum',
    enum: DocumentType
  })
  documentType!: DocumentType;

  @Column()
  documentUrl!: string;

  @Column({ nullable: true })
  originalFileName?: string;

  @Column({ nullable: true })
  mimeType?: string;

  @Column({ nullable: true })
  fileSize?: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  uploadedById?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy?: User;

  @CreateDateColumn()
  uploadedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}