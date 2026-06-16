import express from 'express';
const router = express.Router();
import {
  getDashboard, getAllUsers, updateUser, deleteUser, getAnalytics
} from './admin.controller.js';
import { protect } from '../auth/auth.middleware.js';
import { adminOnly } from '../../shared/middleware/admin.js';

router.use(protect, adminOnly);
router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
