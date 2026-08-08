import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createCertificate,
  getCertificates,
  getCertificate,
  updateCertificate,
  deleteCertificate,
  revokeCertificate,
  getMyCertificates,
} from '../controllers/certificateController.js';

const router = Router();
router.use(protect);

router.post('/', authorize('admin'), createCertificate);
router.get('/all', authorize('admin'), getCertificates);
router.get('/my', authorize('student'), getMyCertificates);
router.get('/:id', getCertificate);
router.put('/:id', authorize('admin'), updateCertificate);
router.delete('/:id', authorize('admin'), deleteCertificate);
router.patch('/:id/revoke', authorize('admin'), revokeCertificate);

export default router;