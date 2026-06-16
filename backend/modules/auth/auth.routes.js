import express from 'express';
const router = express.Router();
import {
  register, login, logout, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword, addAddress, updateAddress, deleteAddress, refreshToken
} from './auth.controller.js';
import { protect } from './auth.middleware.js';

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshToken);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

export default router;
