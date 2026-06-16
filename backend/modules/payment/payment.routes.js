import express from 'express';
const router = express.Router();
import {
  getRazorpayKey, createPaymentOrder, verifyPayment
} from './payment.controller.js';
import { protect } from '../auth/auth.middleware.js';

router.get('/key', getRazorpayKey);
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);

export default router;
