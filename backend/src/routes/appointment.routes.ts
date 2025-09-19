import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { AuthMiddleware } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const appointmentController = new AppointmentController();

router.use(AuthMiddleware.authenticate);

router.post('/', asyncHandler(appointmentController.create.bind(appointmentController)));
router.get('/my-appointments', asyncHandler(appointmentController.getMyAppointments.bind(appointmentController)));
router.get('/calendar', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.RECEPTIONIST), asyncHandler(appointmentController.getCalendar.bind(appointmentController)));
router.get('/:id', asyncHandler(appointmentController.getById.bind(appointmentController)));
router.put('/:id', asyncHandler(appointmentController.update.bind(appointmentController)));
router.patch('/:id/status', asyncHandler(appointmentController.updateStatus.bind(appointmentController)));
router.delete('/:id', asyncHandler(appointmentController.cancel.bind(appointmentController)));

export default router;