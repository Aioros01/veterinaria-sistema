import { Router } from 'express';
import { ConsentController, uploadConsent } from '../controllers/ConsentController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { UserRole } from '../entities/User';

const router = Router();
const consentController = new ConsentController();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener plantillas de consentimientos
router.get('/templates', asyncHandler((req, res) => consentController.getTemplates(req, res)));

// Generar consentimiento desde plantilla
router.post('/generate-from-template',
  authorize(UserRole.VETERINARIAN, UserRole.ADMIN),
  asyncHandler((req, res) => consentController.generateFromTemplate(req, res))
);

// Obtener todos los consentimientos (filtrado por rol)
router.get('/', asyncHandler((req, res) => consentController.getAll(req, res)));

// Obtener consentimientos pendientes de firma (para clientes)
router.get('/pending', asyncHandler((req, res) => consentController.getPending(req, res)));

// Obtener consentimiento por ID
router.get('/:id', asyncHandler((req, res) => consentController.getById(req, res)));

// Obtener consentimientos por historia médica
router.get('/medical-history/:medicalHistoryId', 
  asyncHandler((req, res) => consentController.getByMedicalHistory(req, res))
);

// Crear consentimiento (solo veterinarios y admin)
router.post('/',
  authorize(UserRole.VETERINARIAN, UserRole.ADMIN),
  uploadConsent.single('document'),
  asyncHandler((req, res) => consentController.create(req, res))
);

// Firmar consentimiento (cualquier usuario autenticado puede firmar si es el dueño)
router.post('/:id/sign',
  asyncHandler((req, res) => consentController.sign(req, res))
);

// Rechazar consentimiento
router.post('/:id/reject',
  asyncHandler((req, res) => consentController.reject(req, res))
);

// Cargar consentimiento firmado y cédula
router.post('/:id/upload-signed',
  uploadConsent.fields([
    { name: 'signedConsent', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
  ]),
  asyncHandler((req, res) => consentController.uploadSigned(req, res))
);

// Obtener historial de documentos
router.get('/:id/document-history',
  asyncHandler((req, res) => consentController.getDocumentHistory(req, res))
);

export default router;