import express from 'express';
const router = express.Router();
import {
  getCategories, getAllCategories, getCategory,
  createCategory, updateCategory, deleteCategory
} from './category.controller.js';
import { protect } from '../auth/auth.middleware.js';
import { adminOnly } from '../../shared/middleware/admin.js';
import { uploadSingle } from '../../shared/middleware/upload.js';

router.get('/', getCategories);
router.get('/all', protect, adminOnly, getAllCategories);
router.get('/:id', getCategory);

router.post('/', protect, adminOnly, uploadSingle, createCategory);
router.put('/:id', protect, adminOnly, uploadSingle, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
