"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VaccinationController_1 = require("../controllers/VaccinationController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../entities/User");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const vaccinationController = new VaccinationController_1.VaccinationController();
router.use(auth_1.AuthMiddleware.authenticate);
router.post('/', auth_1.AuthMiddleware.authorize(User_1.UserRole.VETERINARIAN), (0, errorHandler_1.asyncHandler)(vaccinationController.create.bind(vaccinationController)));
router.get('/pet/:petId', (0, errorHandler_1.asyncHandler)(vaccinationController.getByPet.bind(vaccinationController)));
router.get('/upcoming', (0, errorHandler_1.asyncHandler)(vaccinationController.getUpcoming.bind(vaccinationController)));
router.get('/:id', (0, errorHandler_1.asyncHandler)(vaccinationController.getById.bind(vaccinationController)));
router.put('/:id', auth_1.AuthMiddleware.authorize(User_1.UserRole.VETERINARIAN), (0, errorHandler_1.asyncHandler)(vaccinationController.update.bind(vaccinationController)));
exports.default = router;
//# sourceMappingURL=vaccination.routes.js.map