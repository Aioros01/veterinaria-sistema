"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const NotificationService_1 = require("../services/NotificationService");
const redis_1 = require("../config/redis");
const class_validator_1 = require("class-validator");
class AuthController {
    constructor() {
        this.userRepository = database_1.AppDataSource.getRepository(User_1.User);
    }
    async register(req, res) {
        const { firstName, lastName, email, password, phone, address, role } = req.body;
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new errorHandler_1.AppError(400, 'Email already registered');
        }
        const user = this.userRepository.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            address,
            role: role || User_1.UserRole.CLIENT
        });
        const errors = await (0, class_validator_1.validate)(user);
        if (errors.length > 0) {
            throw new errorHandler_1.AppError(400, 'Validation failed');
        }
        await this.userRepository.save(user);
        const token = auth_1.AuthMiddleware.generateToken(user);
        await NotificationService_1.notificationService.sendWelcomeEmail(user);
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            message: 'User registered successfully',
            user: userWithoutPassword,
            token
        });
    }
    async login(req, res) {
        const { email, password } = req.body;
        if (!email) {
            throw new errorHandler_1.AppError(400, 'Email is required');
        }
        // Buscar por email solamente y obtener el password (que está marcado como select: false)
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();
        if (!user || !await user.validatePassword(password)) {
            throw new errorHandler_1.AppError(401, 'Invalid credentials');
        }
        if (!user.isActive) {
            throw new errorHandler_1.AppError(401, 'Account is deactivated');
        }
        const token = auth_1.AuthMiddleware.generateToken(user);
        await redis_1.cache.set(redis_1.CacheKeys.USER(user.id), user, 3600);
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    }
    async forgotPassword(req, res) {
        const { email } = req.body;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            res.json({ message: 'If the email exists, a reset link has been sent' });
            return;
        }
        const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
        await redis_1.cache.set(`reset_token:${resetToken}`, user.id, 3600);
        await NotificationService_1.notificationService.sendPasswordReset(user, resetToken);
        res.json({ message: 'If the email exists, a reset link has been sent' });
    }
    async resetPassword(req, res) {
        const { token, newPassword } = req.body;
        const userId = await redis_1.cache.get(`reset_token:${token}`);
        if (!userId) {
            throw new errorHandler_1.AppError(400, 'Invalid or expired reset token');
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        user.password = newPassword;
        await this.userRepository.save(user);
        await redis_1.cache.del(`reset_token:${token}`);
        await redis_1.cache.del(redis_1.CacheKeys.USER(user.id));
        res.json({ message: 'Password reset successfully' });
    }
    async refreshToken(req, res) {
        const { token } = req.body;
        const decoded = await auth_1.AuthMiddleware.verifyToken(token);
        if (!decoded) {
            throw new errorHandler_1.AppError(401, 'Invalid token');
        }
        const user = await this.userRepository.findOne({
            where: { id: decoded.id, isActive: true }
        });
        if (!user) {
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        const newToken = auth_1.AuthMiddleware.generateToken(user);
        res.json({ token: newToken });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map