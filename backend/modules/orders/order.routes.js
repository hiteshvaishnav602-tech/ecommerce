import express from 'express';
const router = express.Router();
import {
  createOrder, getMyOrders, getOrder, cancelOrder,
  getAllOrders, updateOrderStatus
} from './order.controller.js';
import { protect } from '../auth/auth.middleware.js';
import { adminOnly } from '../../shared/middleware/admin.js';

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
