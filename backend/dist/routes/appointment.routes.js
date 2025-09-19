"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AppointmentController_1 = require("../controllers/AppointmentController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../entities/User");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const appointmentController = new AppointmentController_1.AppointmentController();
router.use(auth_1.AuthMiddleware.authenticate);
router.post('/', (0, errorHandler_1.asyncHandler)(appointmentController.create.bind(appointmentController)));
router.get('/my-appointments', (0, errorHandler_1.asyncHandler)(appointmentController.getMyAppointments.bind(appointmentController)));
router.get('/calendar', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN, User_1.UserRole.VETERINARIAN, User_1.UserRole.RECEPTIONIST), (0, errorHandler_1.asyncHandler)(appointmentController.getCalendar.bind(appointmentController)));
router.get('/:id', (0, errorHandler_1.asyncHandler)(appointmentController.getById.bind(appointmentController)));
router.put('/:id', (0, errorHandler_1.asyncHandler)(appointmentController.update.bind(appointmentController)));
router.patch('/:id/status', (0, errorHandler_1.asyncHandler)(appointmentController.updateStatus.bind(appointmentController)));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(appointmentController.cancel.bind(appointmentController)));
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map