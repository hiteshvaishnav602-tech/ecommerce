import express from 'express';
const router = express.Router();
import {
  getWishlist, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist
} from './wishlist.controller.js';
import { protect } from '../auth/auth.middleware.js';

router.use(protect);
router.get('/', getWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.post('/toggle/:productId', toggleWishlist);
router.delete('/', clearWishlist);

export default router;
