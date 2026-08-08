import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getStudentDashboard } from '../controllers/studentDashboardController.js';

const router = Router();
router.use(protect, authorize('student'));
router.get('/dashboard', getStudentDashboard);

export default router;