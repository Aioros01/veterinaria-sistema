"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
router.post('/register', (0, errorHandler_1.asyncHandler)(authController.register.bind(authController)));
router.post('/login', (0, errorHandler_1.asyncHandler)(authController.login.bind(authController)));
router.post('/forgot-password', (0, errorHandler_1.asyncHandler)(authController.forgotPassword.bind(authController)));
router.post('/reset-password', (0, errorHandler_1.asyncHandler)(authController.resetPassword.bind(authController)));
router.post('/refresh-token', (0, errorHandler_1.asyncHandler)(authController.refreshToken.bind(authController)));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map