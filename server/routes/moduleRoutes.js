import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createModule,
  getModules,
  getModule,
  updateModule,
  deleteModule,
  reorderModules,
} from '../controllers/moduleController.js';

const router = Router();
router.use(protect);
router.post('/', authorize('admin'), createModule);
router.get('/course/:courseId', getModules);
router.get('/:id', getModule);
router.put('/:id', authorize('admin'), updateModule);
router.patch('/:id/reorder', authorize('admin'), reorderModules);
router.delete('/:id', authorize('admin'), deleteModule);

export default router;
