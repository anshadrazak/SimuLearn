import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createCourse,
  getCourses,
  getCourse,
  getFullCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  getAdminCourses,
} from '../controllers/courseController.js';

const router = Router();
router.use(protect);
router.post('/', authorize('admin'), createCourse);
router.get('/', getCourses);
router.get('/instructor', authorize('admin'), getAdminCourses);
router.get('/:id', getCourse);
router.get('/:id/full', getFullCourse);
router.put('/:id', authorize('admin'), updateCourse);
router.patch('/:id/publish', authorize('admin'), publishCourse);
router.delete('/:id', authorize('admin'), deleteCourse);

export default router;