"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HospitalizationController_1 = require("../controllers/HospitalizationController");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
const User_1 = require("../entities/User");
const router = (0, express_1.Router)();
const hospitalizationController = new HospitalizationController_1.HospitalizationController();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Obtener hospitalizaciones activas
router.get('/active', (0, asyncHandler_1.asyncHandler)((req, res) => hospitalizationController.getActive(req, res)));
// Obtener hospitalizaciones por mascota
router.get('/pet/:petId', (0, asyncHandler_1.asyncHandler)((req, res) => hospitalizationController.getByPet(req, res)));
// Obtener hospitalización por ID
router.get('/:id', (0, asyncHandler_1.asyncHandler)((req, res) => hospitalizationController.getById(req, res)));
// Crear nueva hospitalización (solo veterinarios y admin)
router.post('/', (0, auth_1.authorize)(User_1.UserRole.VETERINARIAN, User_1.UserRole.ADMIN), (0, asyncHandler_1.asyncHandler)((req, res) => hospitalizationController.create(req, res)));
// Agregar medicamento a hospitalización (solo veterinarios y admin)
router.post('/:hospitalizationId/medications', (0, auth_1.authorize)(User_1.UserRole.VETERINARIAN, User_1.UserRole.ADMIN), (0, asyncHandler_1.asyncHandler)((req, res) => hospitalizationController.addMedication(req, res)));
// Registrar administración de medicamento (veterinarios, admin y receptionist)
router.post('/medications/:medicationId/administer', (0, auth_1.authorize)(User_1.UserRole.VETERINARIAN, User_1.UserRole.ADMIN, User_1.UserRole.RECEPTIONIST), (0, asyncHandler_1.asyncHandler)((req, res) => hospitalizationController.administerMedication(req, res)));
// Agregar nota de evolución (solo veterinarios y admin)
router.post('/:hospitalizationId/notes', (0, auth_1.authorize)(User_1.UserRole.VETERINARIAN, User_1.UserRole.ADMIN), (0, asyncHandler_1.asyncHandler)((req, res) => hospitalizationController.addNote(req, res)));
// Dar de alta (solo veterinarios y admin)
router.post('/:id/discharge', (0, auth_1.authorize)(User_1.UserRole.VETERINARIAN, User_1.UserRole.ADMIN), (0, asyncHandler_1.asyncHandler)((req, res) => hospitalizationController.discharge(req, res)));
exports.default = router;
//# sourceMappingURL=hospitalization.routes.js.map