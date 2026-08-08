import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createQuiz,
  getQuizzes,
  getAllQuizzes,
  getQuiz,
  getQuizWithQuestions,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  startQuiz,
  submitQuiz,
  getMyAttempts,
  getQuizAttempts,
  gradeQuiz,
  getMyQuizResults,
  getQuizResults,
  getLeaderboard,
  getCourseLeaderboard,
} from '../controllers/quizController.js';

const router = Router();
router.use(protect);

router.post('/', authorize('admin'), createQuiz);
router.get('/all', authorize('admin'), getAllQuizzes);
router.get('/course/:courseId', getQuizzes);
router.get('/:id/attempts/my', authorize('student'), getMyAttempts);
router.get('/my-results', authorize('student'), getMyQuizResults);
router.get('/:id/results/my', authorize('student'), getMyQuizResults);
router.get('/:id/results', authorize('admin'), getQuizResults);
router.get('/:id', getQuiz);
router.get('/:id/start', authorize('student'), startQuiz);
router.get('/:id/questions', getQuizWithQuestions);
router.put('/:id', authorize('admin'), updateQuiz);
router.delete('/:id', authorize('admin'), deleteQuiz);
router.post('/:id/questions', authorize('admin'), addQuestion);
router.put('/questions/:questionId', authorize('admin'), updateQuestion);
router.delete('/questions/:questionId', authorize('admin'), deleteQuestion);
router.post('/:id/submit', authorize('student'), submitQuiz);
router.get('/:id/attempts', authorize('admin'), getQuizAttempts);
router.patch('/attempts/:id/grade', authorize('admin'), gradeQuiz);
router.get('/:id/leaderboard', getLeaderboard);
router.get('/course/:courseId/leaderboard', getCourseLeaderboard);

export default router;