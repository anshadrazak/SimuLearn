import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getDashboardStats, getUsers, getCourses, getAnalyticsOverview } from '../controllers/adminController.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = Router();
router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/courses', getCourses);
router.get('/analytics', getAnalyticsOverview);
router.use('/analytics', analyticsRoutes);

export default router;
