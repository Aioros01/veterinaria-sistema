"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
class AuthMiddleware {
    static async authenticate(req, res, next) {
        const authStart = performance.now();
        const requestId = req.requestId || 'auth';
        try {
            console.log(`[${new Date().toISOString()}] 🔐 [${requestId}] AUTH START`);
            // Step 1: Extract token
            const tokenStart = performance.now();
            const token = req.headers.authorization?.split(' ')[1];
            console.log(`[${new Date().toISOString()}] 📝 [${requestId}] Token extraction: ${(performance.now() - tokenStart).toFixed(2)}ms`);
            if (!token) {
                console.log(`[${new Date().toISOString()}] ❌ [${requestId}] No token provided`);
                res.status(401).json({ error: 'No token provided' });
                return;
            }
            // Step 2: Verify JWT
            const verifyStart = performance.now();
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const verifyTime = performance.now() - verifyStart;
            console.log(`[${new Date().toISOString()}] 🔑 [${requestId}] JWT verification: ${verifyTime.toFixed(2)}ms`);
            if (req.logTiming) {
                req.logTiming(`JWT Token Verified`);
            }
            // Step 3: Database query
            const dbStart = performance.now();
            console.log(`[${new Date().toISOString()}] 🗄️  [${requestId}] Starting DB query for user ID: ${decoded.id}`);
            const userRepository = database_1.AppDataSource.getRepository(User_1.User);
            const user = await userRepository.findOne({
                where: { id: decoded.id, isActive: true }
            });
            const dbTime = performance.now() - dbStart;
            console.log(`[${new Date().toISOString()}] ✅ [${requestId}] DB query complete: ${dbTime.toFixed(2)}ms`);
            if (dbTime > 100) {
                console.log(`[${new Date().toISOString()}] ⚠️  [${requestId}] SLOW DB QUERY DETECTED!`);
            }
            if (req.logTiming) {
                req.logTiming(`User fetched from database`);
            }
            if (!user) {
                console.log(`[${new Date().toISOString()}] ❌ [${requestId}] User not found in DB`);
                res.status(401).json({ error: 'Invalid token' });
                return;
            }
            req.user = user;
            const totalAuthTime = performance.now() - authStart;
            console.log(`[${new Date().toISOString()}] ✅ [${requestId}] AUTH COMPLETE: ${totalAuthTime.toFixed(2)}ms total`);
            if (req.logTiming) {
                req.logTiming(`Authentication completed`);
            }
            next();
        }
        catch (error) {
            const totalTime = performance.now() - authStart;
            console.log(`[${new Date().toISOString()}] ❌ [${requestId}] AUTH FAILED: ${totalTime.toFixed(2)}ms - Error: ${error}`);
            res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
    static authorize(...roles) {
        return (req, res, next) => {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            if (!roles.includes(req.user.role)) {
                res.status(403).json({ error: 'Insufficient permissions' });
                return;
            }
            next();
        };
    }
    static async optionalAuth(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const user = await userRepository.findOne({
                    where: { id: decoded.id, isActive: true }
                });
                req.user = user || undefined;
            }
            next();
        }
        catch (error) {
            next();
        }
    }
    static generateToken(user) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const options = {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        };
        return jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, secret, options);
    }
    static async verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            return null;
        }
    }
}
exports.AuthMiddleware = AuthMiddleware;
// Export functions directly for easier import in routes
exports.authenticate = AuthMiddleware.authenticate;
exports.authorize = AuthMiddleware.authorize;
exports.optionalAuth = AuthMiddleware.optionalAuth;
//# sourceMappingURL=auth.js.map