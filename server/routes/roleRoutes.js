import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
} from '../controllers/roleController.js';

const router = Router();
router.use(protect, authorize('admin'));

router.post('/', createRole);
router.get('/', getRoles);
router.get('/:id', getRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;