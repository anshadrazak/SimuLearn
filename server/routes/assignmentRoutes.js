import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignmentController.js';

const router = Router();
router.use(protect);
router.post('/', authorize('admin'), createAssignment);
router.get('/course/:courseId', getAssignments);
router.get('/:id', getAssignment);
router.put('/:id', authorize('admin'), updateAssignment);
router.delete('/:id', authorize('admin'), deleteAssignment);

export default router;
