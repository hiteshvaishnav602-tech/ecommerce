import express from 'express';
const router = express.Router();
import {
  getBanners, getAllBanners, createBanner, updateBanner, deleteBanner, toggleBanner
} from './banner.controller.js';
import { protect } from '../auth/auth.middleware.js';
import { adminOnly } from '../../shared/middleware/admin.js';
import { uploadSingle } from '../../shared/middleware/upload.js';

router.get('/', getBanners);
router.get('/all', protect, adminOnly, getAllBanners);
router.post('/', protect, adminOnly, uploadSingle, createBanner);
router.put('/:id', protect, adminOnly, uploadSingle, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);
router.put('/:id/toggle', protect, adminOnly, toggleBanner);

export default router;
