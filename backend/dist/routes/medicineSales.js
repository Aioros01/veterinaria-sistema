"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MedicineSaleController_1 = require("../controllers/MedicineSaleController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../entities/User");
const router = (0, express_1.Router)();
const medicineSaleController = new MedicineSaleController_1.MedicineSaleController();
// Todas las rutas requieren autenticación
router.use(auth_1.AuthMiddleware.authenticate);
// Registrar venta desde prescripción
router.post('/from-prescription', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN, User_1.UserRole.VETERINARIAN, User_1.UserRole.RECEPTIONIST), (req, res) => medicineSaleController.createSaleFromPrescription(req, res));
// Registrar venta directa
router.post('/direct', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN, User_1.UserRole.VETERINARIAN, User_1.UserRole.RECEPTIONIST), (req, res) => medicineSaleController.createDirectSale(req, res));
// Obtener ventas
router.get('/', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN, User_1.UserRole.VETERINARIAN, User_1.UserRole.RECEPTIONIST), (req, res) => medicineSaleController.getSales(req, res));
// Obtener resumen de ventas
router.get('/summary', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN, User_1.UserRole.VETERINARIAN), (req, res) => medicineSaleController.getSalesSummary(req, res));
// Cancelar venta
router.put('/:id/cancel', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN, User_1.UserRole.VETERINARIAN), (req, res) => medicineSaleController.cancelSale(req, res));
exports.default = router;
//# sourceMappingURL=medicineSales.js.map