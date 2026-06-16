import Wishlist from './wishlist.model.js';
import Product from '../products/product.model.js';
import ErrorResponse from '../../shared/utils/errorResponse.js';

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    'products',
    'title images price discountPrice discountPercent ratings numReviews stock isActive'
  );

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  // Filter out deleted/inactive products
  wishlist.products = wishlist.products.filter((p) => p && p.isActive !== false);

  res.status(200).json({ success: true, wishlist });
};

// @desc    Add to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new ErrorResponse('Product not found', 404));

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  if (wishlist.products.includes(req.params.productId)) {
    return res.status(200).json({ success: true, message: 'Already in wishlist', wishlist });
  }

  wishlist.products.push(req.params.productId);
  await wishlist.save();

  res.status(200).json({ success: true, message: 'Added to wishlist', wishlist });
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return next(new ErrorResponse('Wishlist not found', 404));

  wishlist.products = wishlist.products.filter(
    (p) => p.toString() !== req.params.productId
  );
  await wishlist.save();

  res.status(200).json({ success: true, message: 'Removed from wishlist' });
};

// @desc    Toggle wishlist (add if not present, remove if present)
// @route   POST /api/wishlist/toggle/:productId
// @access  Private
export const toggleWishlist = async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new ErrorResponse('Product not found', 404));

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  const isInWishlist = wishlist.products.includes(req.params.productId);

  if (isInWishlist) {
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== req.params.productId
    );
    await wishlist.save();
    return res.status(200).json({ success: true, message: 'Removed from wishlist', isInWishlist: false });
  } else {
    wishlist.products.push(req.params.productId);
    await wishlist.save();
    return res.status(200).json({ success: true, message: 'Added to wishlist', isInWishlist: true });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return next(new ErrorResponse('Wishlist not found', 404));

  wishlist.products = [];
  await wishlist.save();

  res.status(200).json({ success: true, message: 'Wishlist cleared' });
};
