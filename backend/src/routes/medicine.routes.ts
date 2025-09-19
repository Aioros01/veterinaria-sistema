import { Router } from 'express';
import { MedicineController } from '../controllers/MedicineController';
import { AuthMiddleware } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const medicineController = new MedicineController();

router.use(AuthMiddleware.authenticate);

router.get('/', asyncHandler(medicineController.getAll.bind(medicineController)));
router.get('/low-stock', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(medicineController.getLowStock.bind(medicineController)));
router.get('/expiring', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(medicineController.getExpiring.bind(medicineController)));
router.get('/:id', asyncHandler(medicineController.getById.bind(medicineController)));
router.post('/', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(medicineController.create.bind(medicineController)));
router.put('/:id', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(medicineController.update.bind(medicineController)));
router.patch('/:id/stock', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(medicineController.updateStock.bind(medicineController)));
router.delete('/:id', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(medicineController.delete.bind(medicineController)));

export default router;