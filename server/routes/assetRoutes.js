import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadAsset, getAssets, deleteAsset } from '../controllers/assetController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();
router.use(protect);
router.post('/', authorize('admin'), upload.single('file'), uploadAsset);
router.get('/', authorize('admin'), getAssets);
router.delete('/:id', authorize('admin'), deleteAsset);

export default router;