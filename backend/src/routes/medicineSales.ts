import { Router } from 'express';
import { MedicineSaleController } from '../controllers/MedicineSaleController';
import { AuthMiddleware } from '../middleware/auth';
import { UserRole } from '../entities/User';

const router = Router();
const medicineSaleController = new MedicineSaleController();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.authenticate);

// Registrar venta desde prescripción
router.post(
  '/from-prescription',
  AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.RECEPTIONIST),
  (req, res) => medicineSaleController.createSaleFromPrescription(req, res)
);

// Registrar venta directa
router.post(
  '/direct',
  AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.RECEPTIONIST),
  (req, res) => medicineSaleController.createDirectSale(req, res)
);

// Obtener ventas
router.get(
  '/',
  AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.RECEPTIONIST),
  (req, res) => medicineSaleController.getSales(req, res)
);

// Obtener resumen de ventas
router.get(
  '/summary',
  AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN),
  (req, res) => medicineSaleController.getSalesSummary(req, res)
);

// Cancelar venta
router.put(
  '/:id/cancel',
  AuthMiddleware.authorize(UserRole.ADMIN, UserRole.VETERINARIAN),
  (req, res) => medicineSaleController.cancelSale(req, res)
);

export default router;