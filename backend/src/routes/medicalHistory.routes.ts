import { Router } from 'express';
import { MedicalHistoryController } from '../controllers/MedicalHistoryController';
import { AuthMiddleware } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { asyncHandler } from '../middleware/errorHandler';
import multer from 'multer';

const upload = multer({ dest: 'uploads/medical/' });

const router = Router();
const medicalHistoryController = new MedicalHistoryController();

router.use(AuthMiddleware.authenticate);

router.post('/', AuthMiddleware.authorize(UserRole.VETERINARIAN), asyncHandler(medicalHistoryController.create.bind(medicalHistoryController)));
router.get('/pet/:petId', asyncHandler(medicalHistoryController.getByPet.bind(medicalHistoryController)));
router.get('/:id', asyncHandler(medicalHistoryController.getById.bind(medicalHistoryController)));
router.put('/:id', AuthMiddleware.authorize(UserRole.VETERINARIAN), asyncHandler(medicalHistoryController.update.bind(medicalHistoryController)));
router.post('/:id/attachments', AuthMiddleware.authorize(UserRole.VETERINARIAN), upload.array('files'), asyncHandler(medicalHistoryController.uploadAttachments.bind(medicalHistoryController)));
router.post('/:id/prescription', AuthMiddleware.authorize(UserRole.VETERINARIAN), asyncHandler(medicalHistoryController.addPrescription.bind(medicalHistoryController)));

export default router;