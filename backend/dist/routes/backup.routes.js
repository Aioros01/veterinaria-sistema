"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = require("../entities/User");
const errorHandler_1 = require("../middleware/errorHandler");
const BackupService_1 = require("../services/BackupService");
const router = (0, express_1.Router)();
// Solo administradores pueden gestionar backups
router.use(auth_1.AuthMiddleware.authenticate);
router.use(auth_1.AuthMiddleware.authorize(User_1.UserRole.ADMIN));
// Obtener estado del sistema de backups
router.get('/status', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const status = BackupService_1.backupService.getStatus();
    res.json(status);
}));
// Listar backups disponibles
router.get('/list', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const backups = BackupService_1.backupService.listBackups();
    res.json({ backups });
}));
// Crear backup manual
router.post('/create', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const filename = await BackupService_1.backupService.createBackup();
    res.json({
        message: 'Backup creado exitosamente',
        filename
    });
}));
// Restaurar backup
router.post('/restore', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        res.status(400).json({ error: 'Nombre de archivo requerido' });
        return;
    }
    await BackupService_1.backupService.restoreBackup(filename);
    res.json({
        message: 'Backup restaurado exitosamente',
        note: 'Reinicie la aplicación para aplicar los cambios'
    });
}));
// Descargar backup
router.get('/download/:filename', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { filename } = req.params;
    const path = require('path');
    const filepath = path.join(process.cwd(), 'backups', filename);
    if (!require('fs').existsSync(filepath)) {
        res.status(404).json({ error: 'Backup no encontrado' });
        return;
    }
    res.download(filepath);
}));
exports.default = router;
//# sourceMappingURL=backup.routes.js.map