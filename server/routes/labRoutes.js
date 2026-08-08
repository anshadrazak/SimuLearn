import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createLab,
  getLabs,
  getAllLabs,
  getLab,
  updateLab,
  deleteLab,
  uploadStarterFile,
  uploadSolutionFile,
  removeStarterFile,
  removeSolutionFile,
  submitLab,
  getLabSubmissions,
  getMyLabSubmission,
  reviewSubmission,
  getMyLabSubmissions,
  getLabProgress,
} from '../controllers/labController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();
router.use(protect);

router.post('/', authorize('admin'), createLab);
router.get('/all', authorize('admin'), getAllLabs);
router.get('/course/:courseId', getLabs);
router.get('/my-submissions', authorize('student'), getMyLabSubmissions);
router.get('/progress/course/:courseId', authorize('student'), getLabProgress);
router.get('/:id', getLab);
router.put('/:id', authorize('admin'), updateLab);
router.delete('/:id', authorize('admin'), deleteLab);
router.post('/:id/starter', authorize('admin'), upload.single('file'), uploadStarterFile);
router.post('/:id/solution', authorize('admin'), upload.single('file'), uploadSolutionFile);
router.delete('/:id/starter/:assetId', authorize('admin'), removeStarterFile);
router.delete('/:id/solution/:assetId', authorize('admin'), removeSolutionFile);
router.post('/:labId/submit', authorize('student'), submitLab);
router.get('/:labId/submissions', authorize('admin'), getLabSubmissions);
router.get('/:labId/my-submission', authorize('student'), getMyLabSubmission);
router.put('/submissions/:id/review', authorize('admin'), reviewSubmission);

export default router;