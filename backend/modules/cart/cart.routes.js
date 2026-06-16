import express from 'express';
const router = express.Router();
import {
  getCart, addToCart, updateCartItem, removeCartItem,
  clearCart, applyCoupon, removeCoupon
} from './cart.controller.js';
import { protect } from '../auth/auth.middleware.js';

router.use(protect);
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);
router.post('/coupon', applyCoupon);
router.delete('/coupon/remove', removeCoupon);

export default router;
