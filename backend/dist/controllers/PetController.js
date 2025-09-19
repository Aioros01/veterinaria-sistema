"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetController = void 0;
const database_1 = require("../config/database");
const Pet_1 = require("../entities/Pet");
const errorHandler_1 = require("../middleware/errorHandler");
const redis_1 = require("../config/redis");
const class_validator_1 = require("class-validator");
class PetController {
    constructor() {
        this.petRepository = database_1.AppDataSource.getRepository(Pet_1.Pet);
    }
    async create(req, res) {
        try {
            const petData = {
                name: req.body.name,
                species: req.body.species || 'other',
                breed: req.body.breed || null,
                birthDate: req.body.birthDate || null,
                gender: req.body.gender || null,
                weight: req.body.weight || null,
                ownerId: req.user.id,
                isActive: true,
                createdBy: req.user.id, // Guardar quién creó la mascota
                updatedBy: req.user.id // Guardar quién la actualizó
            };
            // Crear y guardar directamente sin validación por ahora
            const pet = this.petRepository.create(petData);
            await this.petRepository.save(pet);
            await redis_1.cache.del(redis_1.CacheKeys.PETS_BY_OWNER(req.user.id));
            res.status(201).json({
                message: 'Pet created successfully',
                pet
            });
        }
        catch (error) {
            console.error('Error creating pet:', error);
            throw error;
        }
    }
    async getAll(req, res) {
        // Esta ruta es para veterinarios y admin para obtener todas las mascotas
        let pets;
        if (req.user.role === 'admin' || req.user.role === 'veterinarian' || req.user.role === 'receptionist') {
            pets = await this.petRepository.find({
                where: { isActive: true },
                relations: ['owner'],
                order: { createdAt: 'DESC' }
            });
        }
        else {
            // Los clientes solo pueden ver sus propias mascotas
            pets = await this.petRepository.find({
                where: { ownerId: req.user.id, isActive: true },
                relations: ['owner'],
                order: { createdAt: 'DESC' }
            });
        }
        res.json({ pets });
    }
    async getMyPets(req, res) {
        let pets;
        if (req.user.role === 'admin') {
            // Admin ve TODAS las mascotas con información completa
            pets = await this.petRepository.find({
                where: { isActive: true },
                relations: ['owner'],
                order: { createdAt: 'DESC' }
            });
        }
        else if (req.user.role === 'veterinarian') {
            // Veterinario ve las mascotas de sus pacientes
            pets = await this.petRepository.find({
                where: { isActive: true },
                relations: ['owner'],
                order: { createdAt: 'DESC' }
            });
        }
        else {
            // Cliente ve solo sus mascotas
            const cacheKey = redis_1.CacheKeys.PETS_BY_OWNER(req.user.id);
            pets = await redis_1.cache.get(cacheKey);
            if (!pets) {
                pets = await this.petRepository.find({
                    where: { ownerId: req.user.id, isActive: true },
                    order: { createdAt: 'DESC' }
                });
                await redis_1.cache.set(cacheKey, pets, 1800);
            }
        }
        res.json({ pets });
    }
    async getById(req, res) {
        const { id } = req.params;
        const cacheKey = redis_1.CacheKeys.PET(id);
        let pet = await redis_1.cache.get(cacheKey);
        if (!pet) {
            pet = await this.petRepository.findOne({
                where: { id },
                relations: ['owner', 'appointments', 'vaccinations']
            });
            if (!pet) {
                throw new errorHandler_1.AppError(404, 'Pet not found');
            }
            await redis_1.cache.set(cacheKey, pet, 1800);
        }
        if (pet.ownerId !== req.user.id && req.user.role === 'client') {
            throw new errorHandler_1.AppError(403, 'Access denied');
        }
        res.json({ pet });
    }
    async update(req, res) {
        const { id } = req.params;
        const pet = await this.petRepository.findOne({
            where: { id }
        });
        if (!pet) {
            throw new errorHandler_1.AppError(404, 'Pet not found');
        }
        if (pet.ownerId !== req.user.id && req.user.role === 'client') {
            throw new errorHandler_1.AppError(403, 'Access denied');
        }
        Object.assign(pet, req.body);
        pet.updatedBy = req.user.id; // Registrar quién actualizó
        const errors = await (0, class_validator_1.validate)(pet);
        if (errors.length > 0) {
            const errorMessages = errors.map(error => {
                return Object.values(error.constraints || {}).join(', ');
            }).join('; ');
            throw new errorHandler_1.AppError(400, `Validation failed: ${errorMessages}`);
        }
        await this.petRepository.save(pet);
        await redis_1.cache.del(redis_1.CacheKeys.PET(id));
        await redis_1.cache.del(redis_1.CacheKeys.PETS_BY_OWNER(pet.ownerId));
        res.json({
            message: 'Pet updated successfully',
            pet
        });
    }
    async delete(req, res) {
        const { id } = req.params;
        const pet = await this.petRepository.findOne({
            where: { id }
        });
        if (!pet) {
            throw new errorHandler_1.AppError(404, 'Pet not found');
        }
        if (pet.ownerId !== req.user.id && req.user.role === 'client') {
            throw new errorHandler_1.AppError(403, 'Access denied');
        }
        pet.isActive = false;
        await this.petRepository.save(pet);
        await redis_1.cache.del(redis_1.CacheKeys.PET(id));
        await redis_1.cache.del(redis_1.CacheKeys.PETS_BY_OWNER(pet.ownerId));
        res.json({
            message: 'Pet deleted successfully'
        });
    }
    async uploadPhoto(req, res) {
        const { id } = req.params;
        const pet = await this.petRepository.findOne({
            where: { id }
        });
        if (!pet) {
            throw new errorHandler_1.AppError(404, 'Pet not found');
        }
        if (pet.ownerId !== req.user.id && req.user.role === 'client') {
            throw new errorHandler_1.AppError(403, 'Access denied');
        }
        if (!req.file) {
            throw new errorHandler_1.AppError(400, 'No file uploaded');
        }
        pet.profilePicture = `/uploads/pets/${req.file.filename}`;
        await this.petRepository.save(pet);
        await redis_1.cache.del(redis_1.CacheKeys.PET(id));
        res.json({
            message: 'Photo uploaded successfully',
            photoUrl: pet.profilePicture
        });
    }
}
exports.PetController = PetController;
//# sourceMappingURL=PetController.js.map