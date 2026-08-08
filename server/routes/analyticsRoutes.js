import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  getOverviewStats,
  getUserGrowth,
  getCourseStats,
  getEngagementStats,
  getTopPerformers,
} from '../controllers/analyticsController.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/overview', getOverviewStats);
router.get('/user-growth', getUserGrowth);
router.get('/course-stats', getCourseStats);
router.get('/engagement', getEngagementStats);
router.get('/top-performers', getTopPerformers);

export default router;