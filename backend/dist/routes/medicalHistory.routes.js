"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MedicalHistoryController_1 = require("../controllers/MedicalHistoryController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../entities/User");
const errorHandler_1 = require("../middleware/errorHandler");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: 'uploads/medical/' });
const router = (0, express_1.Router)();
const medicalHistoryController = new MedicalHistoryController_1.MedicalHistoryController();
router.use(auth_1.AuthMiddleware.authenticate);
router.post('/', auth_1.AuthMiddleware.authorize(User_1.UserRole.VETERINARIAN), (0, errorHandler_1.asyncHandler)(medicalHistoryController.create.bind(medicalHistoryController)));
router.get('/pet/:petId', (0, errorHandler_1.asyncHandler)(medicalHistoryController.getByPet.bind(medicalHistoryController)));
router.get('/:id', (0, errorHandler_1.asyncHandler)(medicalHistoryController.getById.bind(medicalHistoryController)));
router.put('/:id', auth_1.AuthMiddleware.authorize(User_1.UserRole.VETERINARIAN), (0, errorHandler_1.asyncHandler)(medicalHistoryController.update.bind(medicalHistoryController)));
router.post('/:id/attachments', auth_1.AuthMiddleware.authorize(User_1.UserRole.VETERINARIAN), upload.array('files'), (0, errorHandler_1.asyncHandler)(medicalHistoryController.uploadAttachments.bind(medicalHistoryController)));
router.post('/:id/prescription', auth_1.AuthMiddleware.authorize(User_1.UserRole.VETERINARIAN), (0, errorHandler_1.asyncHandler)(medicalHistoryController.addPrescription.bind(medicalHistoryController)));
exports.default = router;
//# sourceMappingURL=medicalHistory.routes.js.map