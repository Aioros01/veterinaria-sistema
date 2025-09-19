import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { asyncHandler } from '../middleware/errorHandler';
import { backupService } from '../services/BackupService';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

// Solo administradores pueden gestionar backups
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize(UserRole.ADMIN));

// Obtener estado del sistema de backups
router.get('/status', asyncHandler(async (req: AuthRequest, res: Response) => {
  const status = backupService.getStatus();
  res.json(status);
}));

// Listar backups disponibles
router.get('/list', asyncHandler(async (req: AuthRequest, res: Response) => {
  const backups = backupService.listBackups();
  res.json({ backups });
}));

// Crear backup manual
router.post('/create', asyncHandler(async (req: AuthRequest, res: Response) => {
  const filename = await backupService.createBackup();
  res.json({ 
    message: 'Backup creado exitosamente',
    filename 
  });
}));

// Restaurar backup
router.post('/restore', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { filename } = req.body;
  
  if (!filename) {
    res.status(400).json({ error: 'Nombre de archivo requerido' });
    return;
  }

  await backupService.restoreBackup(filename);
  res.json({ 
    message: 'Backup restaurado exitosamente',
    note: 'Reinicie la aplicación para aplicar los cambios'
  });
}));

// Descargar backup
router.get('/download/:filename', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { filename } = req.params;
  const path = require('path');
  const filepath = path.join(process.cwd(), 'backups', filename);
  
  if (!require('fs').existsSync(filepath)) {
    res.status(404).json({ error: 'Backup no encontrado' });
    return;
  }

  res.download(filepath);
}));

export default router;