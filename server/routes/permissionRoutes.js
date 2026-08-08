import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
} from '../controllers/permissionController.js';

const router = Router();
router.use(protect, authorize('admin'));

router.post('/', createPermission);
router.get('/', getPermissions);
router.get('/:id', getPermission);
router.put('/:id', updatePermission);
router.delete('/:id', deletePermission);

export default router;