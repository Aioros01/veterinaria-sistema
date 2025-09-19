"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const errorHandler_1 = require("../middleware/errorHandler");
const bcrypt = __importStar(require("bcrypt"));
class UserController {
    constructor() {
        this.userRepository = database_1.AppDataSource.getRepository(User_1.User);
    }
    async searchByDocument(req, res) {
        const { documentNumber } = req.params;
        const user = await this.userRepository.findOne({
            where: { documentNumber },
            relations: ['pets']
        });
        if (!user) {
            throw new errorHandler_1.AppError(404, 'Usuario no encontrado con ese número de documento');
        }
        res.json({ user });
    }
    async getProfile(req, res) {
        res.json({ user: req.user });
    }
    async updateProfile(req, res) {
        const user = await this.userRepository.findOne({ where: { id: req.user.id } });
        if (!user)
            throw new errorHandler_1.AppError(404, 'User not found');
        Object.assign(user, req.body);
        await this.userRepository.save(user);
        res.json({ message: 'Profile updated', user });
    }
    async getAllUsers(req, res) {
        const users = await this.userRepository.find();
        res.json({ users });
    }
    async getUserById(req, res) {
        const user = await this.userRepository.findOne({ where: { id: req.params.id } });
        if (!user)
            throw new errorHandler_1.AppError(404, 'User not found');
        res.json({ user });
    }
    async updateUser(req, res) {
        const user = await this.userRepository.findOne({ where: { id: req.params.id } });
        if (!user)
            throw new errorHandler_1.AppError(404, 'User not found');
        Object.assign(user, req.body);
        await this.userRepository.save(user);
        res.json({ message: 'User updated', user });
    }
    async deleteUser(req, res) {
        const user = await this.userRepository.findOne({ where: { id: req.params.id } });
        if (!user)
            throw new errorHandler_1.AppError(404, 'User not found');
        user.isActive = false;
        await this.userRepository.save(user);
        res.json({ message: 'User deleted' });
    }
    // Crear usuario por admin
    async adminCreateUser(req, res) {
        try {
            const { email, password, firstName, lastName, role, phone } = req.body;
            // Verificar si el email ya existe
            const existingUser = await this.userRepository.findOne({ where: { email } });
            if (existingUser) {
                throw new errorHandler_1.AppError(400, 'El email ya está registrado');
            }
            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            // Crear el usuario
            const user = this.userRepository.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || 'client',
                phone,
                isActive: true
            });
            await this.userRepository.save(user);
            // No devolver la contraseña
            const { password: _, ...userWithoutPassword } = user;
            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: userWithoutPassword
            });
        }
        catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    // Restablecer contraseña sin email
    async resetPassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new errorHandler_1.AppError(404, 'Usuario no encontrado');
            }
            // Hash de la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await this.userRepository.save(user);
            res.json({
                message: 'Contraseña restablecida exitosamente',
                email: user.email
            });
        }
        catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }
    // Toggle usuario activo/inactivo
    async toggleActive(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new errorHandler_1.AppError(404, 'Usuario no encontrado');
            }
            // No permitir desactivar el propio usuario
            if (user.id === req.user.id) {
                throw new errorHandler_1.AppError(400, 'No puedes desactivar tu propio usuario');
            }
            user.isActive = !user.isActive;
            await this.userRepository.save(user);
            res.json({
                message: user.isActive ? 'Usuario activado' : 'Usuario desactivado',
                user
            });
        }
        catch (error) {
            console.error('Error toggling user active status:', error);
            throw error;
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map