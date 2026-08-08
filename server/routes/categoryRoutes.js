import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = Router();
router.post('/', protect, authorize('admin'), createCategory);
router.get('/', getCategories);
router.get('/:id', getCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
