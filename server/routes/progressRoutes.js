import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { trackVideoProgress, getLessonProgress, getCourseProgress, checkLessonUnlock } from '../controllers/progressController.js';

const router = Router();
router.use(protect);
router.patch('/:lessonId/progress', trackVideoProgress);
router.get('/:lessonId/progress', getLessonProgress);
router.get('/course/:courseId/progress', getCourseProgress);
router.get('/:lessonId/unlocked', checkLessonUnlock);

export default router;