import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  submitAssignment,
  getSubmissions,
  getSubmission,
  gradeSubmission,
  deleteSubmission,
} from '../controllers/submissionController.js';

const router = Router();
router.use(protect);
router.post('/assignment/:assignmentId', authorize('student'), submitAssignment);
router.get('/assignment/:assignmentId', getSubmissions);
router.get('/:id', getSubmission);
router.put('/:id/grade', authorize('admin'), gradeSubmission);
router.delete('/:id', authorize('student', 'admin'), deleteSubmission);

export default router;
