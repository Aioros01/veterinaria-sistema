import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Pet } from '../entities/Pet';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { cache, CacheKeys } from '../config/redis';
import { validate } from 'class-validator';

export class PetController {
  private petRepository = AppDataSource.getRepository(Pet);

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const petData = {
        name: req.body.name,
        species: req.body.species || 'other',
        breed: req.body.breed || null,
        birthDate: req.body.birthDate || null,
        gender: req.body.gender || null,
        weight: req.body.weight || null,
        ownerId: req.user!.id,
        isActive: true,
        createdBy: req.user!.id,  // Guardar quién creó la mascota
        updatedBy: req.user!.id   // Guardar quién la actualizó
      };

      // Crear y guardar directamente sin validación por ahora
      const pet = this.petRepository.create(petData);
      await this.petRepository.save(pet);
    
      await cache.del(CacheKeys.PETS_BY_OWNER(req.user!.id));
    
      res.status(201).json({
        message: 'Pet created successfully',
        pet
      });
    } catch (error) {
      console.error('Error creating pet:', error);
      throw error;
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    // Esta ruta es para veterinarios y admin para obtener todas las mascotas
    let pets;
    
    if (req.user!.role === 'admin' || req.user!.role === 'veterinarian' || req.user!.role === 'receptionist') {
      pets = await this.petRepository.find({
        where: { isActive: true },
        relations: ['owner'],
        order: { createdAt: 'DESC' }
      });
    } else {
      // Los clientes solo pueden ver sus propias mascotas
      pets = await this.petRepository.find({
        where: { ownerId: req.user!.id, isActive: true },
        relations: ['owner'],
        order: { createdAt: 'DESC' }
      });
    }

    res.json({ pets });
  }

  async getMyPets(req: AuthRequest, res: Response): Promise<void> {
    let pets;

    if (req.user!.role === 'admin') {
      // Admin ve TODAS las mascotas con información completa
      pets = await this.petRepository.find({
        where: { isActive: true },
        relations: ['owner'],
        order: { createdAt: 'DESC' }
      });
    } else if (req.user!.role === 'veterinarian') {
      // Veterinario ve las mascotas de sus pacientes
      pets = await this.petRepository.find({
        where: { isActive: true },
        relations: ['owner'],
        order: { createdAt: 'DESC' }
      });
    } else {
      // Cliente ve solo sus mascotas
      const cacheKey = CacheKeys.PETS_BY_OWNER(req.user!.id);
      pets = await cache.get<Pet[]>(cacheKey);

      if (!pets) {
        pets = await this.petRepository.find({
          where: { ownerId: req.user!.id, isActive: true },
          order: { createdAt: 'DESC' }
        });

        await cache.set(cacheKey, pets, 1800);
      }
    }

    res.json({ pets });
  }

  async getByOwner(req: AuthRequest, res: Response): Promise<void> {
    const { ownerId } = req.params;

    // Solo admin y veterinario pueden ver mascotas de otros dueños
    if (req.user!.role !== 'admin' && req.user!.role !== 'veterinarian') {
      if (req.user!.id !== ownerId) {
        throw new AppError(403, 'No autorizado para ver mascotas de otros usuarios');
      }
    }

    const pets = await this.petRepository.find({
      where: { ownerId, isActive: true },
      relations: ['owner'],
      order: { createdAt: 'DESC' }
    });

    res.json(pets);
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    
    const cacheKey = CacheKeys.PET(id);
    let pet = await cache.get<Pet>(cacheKey);

    if (!pet) {
      pet = await this.petRepository.findOne({
        where: { id },
        relations: ['owner', 'appointments', 'vaccinations']
      });

      if (!pet) {
        throw new AppError(404, 'Pet not found');
      }

      await cache.set(cacheKey, pet, 1800);
    }

    if (pet.ownerId !== req.user!.id && req.user!.role === 'client') {
      throw new AppError(403, 'Access denied');
    }

    res.json({ pet });
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const pet = await this.petRepository.findOne({
      where: { id }
    });

    if (!pet) {
      throw new AppError(404, 'Pet not found');
    }

    if (pet.ownerId !== req.user!.id && req.user!.role === 'client') {
      throw new AppError(403, 'Access denied');
    }

    Object.assign(pet, req.body);
    pet.updatedBy = req.user!.id;  // Registrar quién actualizó

    const errors = await validate(pet);
    if (errors.length > 0) {
      const errorMessages = errors.map(error => {
        return Object.values(error.constraints || {}).join(', ');
      }).join('; ');
      throw new AppError(400, `Validation failed: ${errorMessages}`);
    }

    await this.petRepository.save(pet);
    
    await cache.del(CacheKeys.PET(id));
    await cache.del(CacheKeys.PETS_BY_OWNER(pet.ownerId));
    
    res.json({
      message: 'Pet updated successfully',
      pet
    });
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const pet = await this.petRepository.findOne({
      where: { id }
    });

    if (!pet) {
      throw new AppError(404, 'Pet not found');
    }

    if (pet.ownerId !== req.user!.id && req.user!.role === 'client') {
      throw new AppError(403, 'Access denied');
    }

    pet.isActive = false;
    await this.petRepository.save(pet);
    
    await cache.del(CacheKeys.PET(id));
    await cache.del(CacheKeys.PETS_BY_OWNER(pet.ownerId));
    
    res.json({
      message: 'Pet deleted successfully'
    });
  }

  async uploadPhoto(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const pet = await this.petRepository.findOne({
      where: { id }
    });

    if (!pet) {
      throw new AppError(404, 'Pet not found');
    }

    if (pet.ownerId !== req.user!.id && req.user!.role === 'client') {
      throw new AppError(403, 'Access denied');
    }

    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    pet.profilePicture = `/uploads/pets/${req.file.filename}`;
    await this.petRepository.save(pet);
    
    await cache.del(CacheKeys.PET(id));
    
    res.json({
      message: 'Photo uploaded successfully',
      photoUrl: pet.profilePicture
    });
  }
}