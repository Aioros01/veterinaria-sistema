"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DashboardController_1 = require("../controllers/DashboardController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../entities/User");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const dashboardController = new DashboardController_1.DashboardController();
router.use(auth_1.AuthMiddleware.authenticate);
router.get('/stats', (0, errorHandler_1.asyncHandler)(dashboardController.getStats.bind(dashboardController)));
router.get('/appointments-summary', (0, errorHandler_1.asyncHandler)(dashboardController.getAppointmentsSummary.bind(dashboardController)));
router.get('/revenue', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(dashboardController.getRevenue.bind(dashboardController)));
router.get('/popular-services', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN, User_1.UserRole.VETERINARIAN), (0, errorHandler_1.asyncHandler)(dashboardController.getPopularServices.bind(dashboardController)));
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map