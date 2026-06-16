import express from 'express';
const router = express.Router();
import {
  getProductReviews, createReview, updateReview, deleteReview,
  toggleHideReview, getAllReviews
} from './review.controller.js';
import { protect } from '../auth/auth.middleware.js';
import { adminOnly } from '../../shared/middleware/admin.js';

router.get('/', protect, adminOnly, getAllReviews);
router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/hide', protect, adminOnly, toggleHideReview);

export default router;
