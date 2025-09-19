"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ConsentController_1 = require("../controllers/ConsentController");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
const User_1 = require("../entities/User");
const router = (0, express_1.Router)();
const consentController = new ConsentController_1.ConsentController();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Obtener plantillas de consentimientos
router.get('/templates', (0, asyncHandler_1.asyncHandler)((req, res) => consentController.getTemplates(req, res)));
// Generar consentimiento desde plantilla
router.post('/generate-from-template', (0, auth_1.authorize)(User_1.UserRole.VETERINARIAN, User_1.UserRole.ADMIN), (0, asyncHandler_1.asyncHandler)((req, res) => consentController.generateFromTemplate(req, res)));
// Obtener todos los consentimientos (filtrado por rol)
router.get('/', (0, asyncHandler_1.asyncHandler)((req, res) => consentController.getAll(req, res)));
// Obtener consentimientos pendientes de firma (para clientes)
router.get('/pending', (0, asyncHandler_1.asyncHandler)((req, res) => consentController.getPending(req, res)));
// Obtener consentimiento por ID
router.get('/:id', (0, asyncHandler_1.asyncHandler)((req, res) => consentController.getById(req, res)));
// Obtener consentimientos por historia médica
router.get('/medical-history/:medicalHistoryId', (0, asyncHandler_1.asyncHandler)((req, res) => consentController.getByMedicalHistory(req, res)));
// Crear consentimiento (solo veterinarios y admin)
router.post('/', (0, auth_1.authorize)(User_1.UserRole.VETERINARIAN, User_1.UserRole.ADMIN), ConsentController_1.uploadConsent.single('document'), (0, asyncHandler_1.asyncHandler)((req, res) => consentController.create(req, res)));
// Firmar consentimiento (cualquier usuario autenticado puede firmar si es el dueño)
router.post('/:id/sign', (0, asyncHandler_1.asyncHandler)((req, res) => consentController.sign(req, res)));
// Rechazar consentimiento
router.post('/:id/reject', (0, asyncHandler_1.asyncHandler)((req, res) => consentController.reject(req, res)));
// Cargar consentimiento firmado y cédula
router.post('/:id/upload-signed', ConsentController_1.uploadConsent.fields([
    { name: 'signedConsent', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
]), (0, asyncHandler_1.asyncHandler)((req, res) => consentController.uploadSigned(req, res)));
// Obtener historial de documentos
router.get('/:id/document-history', (0, asyncHandler_1.asyncHandler)((req, res) => consentController.getDocumentHistory(req, res)));
exports.default = router;
//# sourceMappingURL=consent.routes.js.map