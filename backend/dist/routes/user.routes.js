"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../entities/User");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const userController = new UserController_1.UserController();
router.use(auth_1.AuthMiddleware.authenticate);
router.get('/profile', (0, errorHandler_1.asyncHandler)(userController.getProfile.bind(userController)));
router.put('/profile', (0, errorHandler_1.asyncHandler)(userController.updateProfile.bind(userController)));
router.get('/', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN, User_1.UserRole.VETERINARIAN), (0, errorHandler_1.asyncHandler)(userController.getAllUsers.bind(userController)));
// Rutas de administración (solo admin)
router.post('/admin-create', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(userController.adminCreateUser.bind(userController)));
router.post('/:id/reset-password', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(userController.resetPassword.bind(userController)));
router.patch('/:id/toggle-active', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(userController.toggleActive.bind(userController)));
router.get('/:id', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN, User_1.UserRole.VETERINARIAN), (0, errorHandler_1.asyncHandler)(userController.getUserById.bind(userController)));
router.put('/:id', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(userController.updateUser.bind(userController)));
router.delete('/:id', auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN), (0, errorHandler_1.asyncHandler)(userController.deleteUser.bind(userController)));
exports.default = router;
//# sourceMappingURL=user.routes.js.map