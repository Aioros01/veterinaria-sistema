import { Router } from 'express';

const router = Router();

// Endpoint simple que mantiene el servidor activo
router.get('/keep-alive', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'veterinaria-backend'
  });
});

export default router;