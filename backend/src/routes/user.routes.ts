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

// Ruta para que veterinarios creen clientes (DEBE IR ANTES de /:id)
router.post('/create-client', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(userController.createClient.bind(userController)));

// Veterinarios también pueden resetear contraseñas (pero solo de clientes - validado en el controlador)
router.post('/:id/reset-password', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(userController.resetPassword.bind(userController)));
router.patch('/:id/toggle-active', AuthMiddleware.authorize(UserRole.ADMIN), asyncHandler(userController.toggleActive.bind(userController)));

router.get('/:id', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(userController.getUserById.bind(userController)));
// Permitir que veterinarios también puedan editar usuarios (se registrará en auditoría)
router.put('/:id', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(userController.updateUser.bind(userController)));
router.delete('/:id', AuthMiddleware.authorize(UserRole.ADMIN), asyncHandler(userController.deleteUser.bind(userController)));

export default router;