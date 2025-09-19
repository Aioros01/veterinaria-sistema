import { Router } from 'express';
import { MedicineSaleController } from '../controllers/MedicineSaleController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const medicineSaleController = new MedicineSaleController();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Registrar venta desde prescripción
router.post(
  '/from-prescription',
  authorize(['admin', 'veterinarian', 'receptionist']),
  (req, res) => medicineSaleController.createSaleFromPrescription(req, res)
);

// Registrar venta directa
router.post(
  '/direct',
  authorize(['admin', 'veterinarian', 'receptionist']),
  (req, res) => medicineSaleController.createDirectSale(req, res)
);

// Obtener ventas
router.get(
  '/',
  authorize(['admin', 'veterinarian', 'receptionist']),
  (req, res) => medicineSaleController.getSales(req, res)
);

// Obtener resumen de ventas
router.get(
  '/summary',
  authorize(['admin', 'veterinarian']),
  (req, res) => medicineSaleController.getSalesSummary(req, res)
);

// Cancelar venta
router.put(
  '/:id/cancel',
  authorize(['admin', 'veterinarian']),
  (req, res) => medicineSaleController.cancelSale(req, res)
);

export default router;