import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createQuestionBank,
  getQuestionBanks,
  getQuestionBank,
  updateQuestionBank,
  deleteQuestionBank,
  addQuestionToBank,
  removeQuestionFromBank,
} from '../controllers/questionBankController.js';

const router = Router();
router.use(protect);

router.post('/', authorize('admin'), createQuestionBank);
router.get('/course/:courseId', getQuestionBanks);
router.get('/:id', getQuestionBank);
router.put('/:id', authorize('admin'), updateQuestionBank);
router.delete('/:id', authorize('admin'), deleteQuestionBank);
router.post('/:id/questions', authorize('admin'), addQuestionToBank);
router.delete('/:id/questions/:questionId', authorize('admin'), removeQuestionFromBank);

export default router;