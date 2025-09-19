import { BaseEntity } from './BaseEntity';
import { Pet } from './Pet';
import { Appointment } from './Appointment';
export declare enum UserRole {
    ADMIN = "admin",
    VETERINARIAN = "veterinarian",
    RECEPTIONIST = "receptionist",
    CLIENT = "client"
}
export declare class User extends BaseEntity {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    documentType: string;
    documentNumber: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    role: UserRole;
    isActive: boolean;
    profilePicture: string;
    customFields: Record<string, any>;
    emailNotifications: boolean;
    whatsappNotifications: boolean;
    pets: Pet[];
    veterinarianAppointments: Appointment[];
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    getFullName(): string;
}
//# sourceMappingURL=User.d.ts.map