import { Router } from 'express';
import { HospitalizationController } from '../controllers/HospitalizationController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { UserRole } from '../entities/User';

const router = Router();
const hospitalizationController = new HospitalizationController();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener hospitalizaciones activas
router.get('/active', asyncHandler((req, res) => hospitalizationController.getActive(req, res)));

// Obtener hospitalizaciones por mascota
router.get('/pet/:petId', asyncHandler((req, res) => hospitalizationController.getByPet(req, res)));

// Obtener hospitalización por ID
router.get('/:id', asyncHandler((req, res) => hospitalizationController.getById(req, res)));

// Crear nueva hospitalización (solo veterinarios y admin)
router.post('/', 
  authorize(UserRole.VETERINARIAN, UserRole.ADMIN),
  asyncHandler((req, res) => hospitalizationController.create(req, res))
);

// Agregar medicamento a hospitalización (solo veterinarios y admin)
router.post('/:hospitalizationId/medications',
  authorize(UserRole.VETERINARIAN, UserRole.ADMIN),
  asyncHandler((req, res) => hospitalizationController.addMedication(req, res))
);

// Registrar administración de medicamento (veterinarios, admin y receptionist)
router.post('/medications/:medicationId/administer',
  authorize(UserRole.VETERINARIAN, UserRole.ADMIN, UserRole.RECEPTIONIST),
  asyncHandler((req, res) => hospitalizationController.administerMedication(req, res))
);

// Agregar nota de evolución (solo veterinarios y admin)
router.post('/:hospitalizationId/notes',
  authorize(UserRole.VETERINARIAN, UserRole.ADMIN),
  asyncHandler((req, res) => hospitalizationController.addNote(req, res))
);

// Dar de alta (solo veterinarios y admin)
router.post('/:id/discharge',
  authorize(UserRole.VETERINARIAN, UserRole.ADMIN),
  asyncHandler((req, res) => hospitalizationController.discharge(req, res))
);

export default router;