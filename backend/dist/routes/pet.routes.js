"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PetController_1 = require("../controllers/PetController");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: 'uploads/pets/' });
const router = (0, express_1.Router)();
const petController = new PetController_1.PetController();
router.use(auth_1.AuthMiddleware.authenticate);
router.get('/', (0, errorHandler_1.asyncHandler)(petController.getAll.bind(petController)));
router.post('/', (0, errorHandler_1.asyncHandler)(petController.create.bind(petController)));
router.get('/my-pets', (0, errorHandler_1.asyncHandler)(petController.getMyPets.bind(petController)));
router.get('/:id', (0, errorHandler_1.asyncHandler)(petController.getById.bind(petController)));
router.put('/:id', (0, errorHandler_1.asyncHandler)(petController.update.bind(petController)));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(petController.delete.bind(petController)));
router.post('/:id/photo', upload.single('photo'), (0, errorHandler_1.asyncHandler)(petController.uploadPhoto.bind(petController)));
exports.default = router;
//# sourceMappingURL=pet.routes.js.map