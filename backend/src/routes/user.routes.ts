import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const userController = new UserController();

router.use(AuthMiddleware.authenticate);

router.get('/profile', asyncHandler(userController.getProfile.bind(userController)));
router.put('/profile', asyncHandler(userController.updateProfile.bind(userController)));
router.get('/', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(userController.getAllUsers.bind(userController)));

// Rutas de administración (solo admin)
router.post('/admin-create', AuthMiddleware.authorize(UserRole.ADMIN), asyncHandler(userController.adminCreateUser.bind(userController)));
router.post('/:id/reset-password', AuthMiddleware.authorize(UserRole.ADMIN), asyncHandler(userController.resetPassword.bind(userController)));
router.patch('/:id/toggle-active', AuthMiddleware.authorize(UserRole.ADMIN), asyncHandler(userController.toggleActive.bind(userController)));

router.get('/:id', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(userController.getUserById.bind(userController)));
router.put('/:id', AuthMiddleware.authorize(UserRole.ADMIN), asyncHandler(userController.updateUser.bind(userController)));
router.delete('/:id', AuthMiddleware.authorize(UserRole.ADMIN), asyncHandler(userController.deleteUser.bind(userController)));

export default router;