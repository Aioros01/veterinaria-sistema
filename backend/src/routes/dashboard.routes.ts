import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { AuthMiddleware } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const dashboardController = new DashboardController();

router.use(AuthMiddleware.authenticate);

router.get('/stats', asyncHandler(dashboardController.getStats.bind(dashboardController)));
router.get('/appointments-summary', asyncHandler(dashboardController.getAppointmentsSummary.bind(dashboardController)));
router.get('/revenue', AuthMiddleware.authorize(UserRole.ADMIN), asyncHandler(dashboardController.getRevenue.bind(dashboardController)));
router.get('/popular-services', AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN), asyncHandler(dashboardController.getPopularServices.bind(dashboardController)));

export default router;