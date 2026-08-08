import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createScenario,
  getScenarios,
  getAllScenarios,
  getScenario,
  getFullScenario,
  updateScenario,
  deleteScenario,
  uploadEvidence,
  removeEvidence,
  addTask,
  getTasks,
  updateTask,
  deleteTask,
  submitScenario,
  getScenarioSubmissions,
  getMyScenarioSubmission,
  reviewScenarioSubmission,
  getMyScenarioSubmissions,
  getScenarioProgress,
} from '../controllers/scenarioController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();
router.use(protect);

router.post('/', authorize('admin'), createScenario);
router.get('/all', authorize('admin'), getAllScenarios);
router.get('/course/:courseId', getScenarios);
router.get('/my-submissions', authorize('student'), getMyScenarioSubmissions);
router.get('/progress/course/:courseId', authorize('student'), getScenarioProgress);
router.get('/:id', getScenario);
router.get('/:id/full', getFullScenario);
router.put('/:id', authorize('admin'), updateScenario);
router.delete('/:id', authorize('admin'), deleteScenario);
router.post('/:id/evidence', authorize('admin'), upload.single('file'), uploadEvidence);
router.delete('/:id/evidence/:assetId', authorize('admin'), removeEvidence);
router.post('/:id/tasks', authorize('admin'), addTask);
router.get('/:id/tasks', getTasks);
router.put('/tasks/:taskId', authorize('admin'), updateTask);
router.delete('/tasks/:taskId', authorize('admin'), deleteTask);
router.post('/:scenarioId/submit', authorize('student'), submitScenario);
router.get('/:scenarioId/submissions', authorize('admin'), getScenarioSubmissions);
router.get('/:scenarioId/my-submission', authorize('student'), getMyScenarioSubmission);
router.put('/submissions/:id/review', authorize('admin'), reviewScenarioSubmission);

export default router;