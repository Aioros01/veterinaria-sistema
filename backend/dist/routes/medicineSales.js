"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MedicineSaleController_1 = require("../controllers/MedicineSaleController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const medicineSaleController = new MedicineSaleController_1.MedicineSaleController();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Registrar venta desde prescripción
router.post('/from-prescription', (0, auth_1.authorize)(['admin', 'veterinarian', 'receptionist']), (req, res) => medicineSaleController.createSaleFromPrescription(req, res));
// Registrar venta directa
router.post('/direct', (0, auth_1.authorize)(['admin', 'veterinarian', 'receptionist']), (req, res) => medicineSaleController.createDirectSale(req, res));
// Obtener ventas
router.get('/', (0, auth_1.authorize)(['admin', 'veterinarian', 'receptionist']), (req, res) => medicineSaleController.getSales(req, res));
// Obtener resumen de ventas
router.get('/summary', (0, auth_1.authorize)(['admin', 'veterinarian']), (req, res) => medicineSaleController.getSalesSummary(req, res));
// Cancelar venta
router.put('/:id/cancel', (0, auth_1.authorize)(['admin', 'veterinarian']), (req, res) => medicineSaleController.cancelSale(req, res));
exports.default = router;
//# sourceMappingURL=medicineSales.js.map