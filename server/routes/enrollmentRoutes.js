import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  enroll,
  unenroll,
  getMyEnrollments,
  getCourseEnrollments,
  getEnrollment,
  updateProgress,
} from '../controllers/enrollmentController.js';

const router = Router();
router.use(protect);
router.post('/course/:courseId', authorize('student'), enroll);
router.delete('/course/:courseId', authorize('student'), unenroll);
router.get('/my', authorize('student'), getMyEnrollments);
router.get('/course/:courseId', getCourseEnrollments);
router.get('/:id', getEnrollment);
router.patch('/:id/progress', updateProgress);

export default router;
