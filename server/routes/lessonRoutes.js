import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createLesson,
  getLessons,
  getLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from '../controllers/lessonController.js';

const router = Router();
router.use(protect);
router.post('/', authorize('admin'), createLesson);
router.get('/module/:moduleId', getLessons);
router.get('/:id', getLesson);
router.put('/:id', authorize('admin'), updateLesson);
router.patch('/:id/reorder', authorize('admin'), reorderLessons);
router.delete('/:id', authorize('admin'), deleteLesson);

export default router;
