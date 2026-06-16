import express from 'express';
const router = express.Router();
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  deleteProductImage, getFeaturedProducts, getTrendingProducts,
  getNewArrivals, getBestSellers, getRelatedProducts, uploadImage
} from './product.controller.js';
import { protect } from '../auth/auth.middleware.js';
import { adminOnly } from '../../shared/middleware/admin.js';
import { uploadMultiple, uploadSingle } from '../../shared/middleware/upload.js';
import Product from './product.model.js';
import Category from '../categories/category.model.js';

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.json({ success: true, products: [], categories: [] });
    const regex = { $regex: q.trim(), $options: 'i' };
    const [products, categories] = await Promise.all([
      Product.find({ isActive: true, $or: [{ title: regex }, { brand: regex }, { tags: regex }] })
        .select('title slug images discountPrice price discountPercent ratings category brand')
        .populate('category', 'name')
        .limit(6).lean(),
      Category.find({ name: regex }).select('name slug').limit(3).lean(),
    ]);
    res.json({ success: true, products, categories });
  } catch (e) { res.status(500).json({ success: false }); }
});
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);

router.post('/upload-image', protect, adminOnly, uploadSingle, uploadImage);
router.post('/', protect, adminOnly, uploadMultiple, createProduct);
router.put('/:id', protect, adminOnly, uploadMultiple, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.delete('/:id/images/:public_id', protect, adminOnly, deleteProductImage);

export default router;
