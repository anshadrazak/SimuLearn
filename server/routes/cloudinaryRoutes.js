import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadVideo, deleteVideo } from '../controllers/cloudinaryController.js';
import { uploadMemory } from '../middlewares/uploadMiddleware.js';

const router = Router();
router.post('/video', protect, authorize('admin'), uploadMemory.single('video'), uploadVideo);
router.delete('/video/:publicId', protect, authorize('admin'), deleteVideo);

export default router;
