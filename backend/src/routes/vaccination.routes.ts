import { Router } from 'express';
import { VaccinationController } from '../controllers/VaccinationController';
import { AuthMiddleware } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const vaccinationController = new VaccinationController();

router.use(AuthMiddleware.authenticate);

router.post('/', AuthMiddleware.authorize(UserRole.VETERINARIAN), asyncHandler(vaccinationController.create.bind(vaccinationController)));
router.get('/pet/:petId', asyncHandler(vaccinationController.getByPet.bind(vaccinationController)));
router.get('/upcoming', asyncHandler(vaccinationController.getUpcoming.bind(vaccinationController)));
router.get('/:id', asyncHandler(vaccinationController.getById.bind(vaccinationController)));
router.put('/:id', AuthMiddleware.authorize(UserRole.VETERINARIAN), asyncHandler(vaccinationController.update.bind(vaccinationController)));

export default router;