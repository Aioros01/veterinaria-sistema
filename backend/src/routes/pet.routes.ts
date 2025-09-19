import { Router } from 'express';
import { PetController } from '../controllers/PetController';
import { AuthMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import multer from 'multer';

const upload = multer({ dest: 'uploads/pets/' });

const router = Router();
const petController = new PetController();

router.use(AuthMiddleware.authenticate);

router.get('/', asyncHandler(petController.getAll.bind(petController)));
router.post('/', asyncHandler(petController.create.bind(petController)));
router.get('/my-pets', asyncHandler(petController.getMyPets.bind(petController)));
router.get('/owner/:ownerId', asyncHandler(petController.getByOwner.bind(petController)));
router.get('/:id', asyncHandler(petController.getById.bind(petController)));
router.put('/:id', asyncHandler(petController.update.bind(petController)));
router.delete('/:id', asyncHandler(petController.delete.bind(petController)));
router.post('/:id/photo', upload.single('photo'), asyncHandler(petController.uploadPhoto.bind(petController)));

export default router;