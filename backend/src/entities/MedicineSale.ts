import { Entity, Column, ManyToOne, JoinColumn, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { AuditableEntity } from './AuditableEntity';
import { Medicine } from './Medicine';
import { Prescription } from './Prescription';
import { User } from './User';
import { Pet } from './Pet';

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PurchaseLocation {
  IN_CLINIC = 'in_clinic',     // Compra en la veterinaria
  EXTERNAL = 'external',       // Compra externa
  SPLIT = 'split'             // Compra parcial (parte en clínica, parte externa)
}

@Entity('medicine_sales')
@Index(['prescriptionId'])
@Index(['medicineId'])
@Index(['clientId'])
@Index(['saleDate'])
export class MedicineSale extends AuditableEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  saleDate: Date;

  @Column({ type: 'integer' })
  quantity: number;  // Cantidad total de la venta

  @Column({ type: 'integer', nullable: true })
  quantityInClinic: number;  // Cantidad comprada en la clínica

  @Column({ type: 'integer', nullable: true })
  quantityExternal: number;  // Cantidad a comprar externamente

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalPrice: number;

  @Column({
    type: 'varchar',
    default: SaleStatus.COMPLETED
  })
  status: SaleStatus;

  @Column({
    type: 'varchar',
    default: PurchaseLocation.IN_CLINIC
  })
  purchaseLocation: PurchaseLocation;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  externalPharmacy: string;  // Nombre de la farmacia externa si aplica

  @Column({ nullable: true })
  invoiceNumber: string;

  @Column({ nullable: true })
  prescriptionId: string;

  @Column()
  medicineId: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  petId: string;

  @Column({ nullable: true })
  veterinarianId: string;

  @ManyToOne(() => Prescription, { nullable: true })
  @JoinColumn({ name: 'prescriptionId' })
  prescription: Prescription;

  @ManyToOne(() => Medicine)
  @JoinColumn({ name: 'medicineId' })
  medicine: Medicine;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ManyToOne(() => Pet, { nullable: true })
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'veterinarianId' })
  veterinarian: User;

  @BeforeInsert()
  @BeforeUpdate()
  calculatePrices() {
    // Calcular precio total
    this.totalPrice = this.quantity * this.unitPrice;

    // Calcular descuento
    if (this.discountPercentage > 0) {
      this.discountAmount = this.totalPrice * (this.discountPercentage / 100);
    }

    // Calcular precio final
    this.finalPrice = this.totalPrice - this.discountAmount;
  }

  // Método para verificar si la venta afecta el inventario
  affectsInventory(): boolean {
    return this.purchaseLocation === PurchaseLocation.IN_CLINIC &&
           this.status === SaleStatus.COMPLETED;
  }
}