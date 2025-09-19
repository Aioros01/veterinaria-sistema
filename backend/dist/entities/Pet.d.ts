import { AuditableEntity } from './AuditableEntity';
import { User } from './User';
import { MedicalHistory } from './MedicalHistory';
import { Appointment } from './Appointment';
import { Vaccination } from './Vaccination';
import { Hospitalization } from './Hospitalization';
import { Consent } from './Consent';
export declare enum PetSpecies {
    DOG = "dog",
    CAT = "cat",
    BIRD = "bird",
    RABBIT = "rabbit",
    HAMSTER = "hamster",
    GUINEA_PIG = "guinea_pig",
    REPTILE = "reptile",
    OTHER = "other"
}
export declare enum PetGender {
    MALE = "male",
    FEMALE = "female"
}
export declare class Pet extends AuditableEntity {
    name: string;
    species: PetSpecies;
    breed: string;
    birthDate: Date;
    gender: PetGender;
    weight: number;
    color: string;
    microchipNumber: string;
    isNeutered: boolean;
    allergies: string;
    specialConditions: string;
    profilePicture: string;
    customFields: Record<string, any>;
    isActive: boolean;
    ownerId: string;
    owner: User;
    medicalHistories: MedicalHistory[];
    appointments: Appointment[];
    vaccinations: Vaccination[];
    hospitalizations: Hospitalization[];
    consents: Consent[];
    getAge(): number | null;
}
//# sourceMappingURL=Pet.d.ts.map