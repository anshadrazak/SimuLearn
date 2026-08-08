import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
} from '../controllers/userController.js';

const router = Router();
router.use(protect);
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUser);
router.put('/:id', authorize('admin'), updateUser);
router.patch('/:id/role', authorize('admin'), updateUserRole);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
