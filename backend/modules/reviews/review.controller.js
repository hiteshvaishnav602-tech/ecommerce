import Review from './review.model.js';
import Product from '../products/product.model.js';
import Order from '../orders/order.model.js';
import ErrorResponse from '../../shared/utils/errorResponse.js';

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isHidden: false })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ product: req.params.productId, isHidden: false }),
  ]);

  res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), reviews });
};

// @desc    Create review
// @route   POST /api/reviews/product/:productId
// @access  Private
export const createReview = async (req, res, next) => {
  const { rating, title, comment } = req.body;

  const product = await Product.findById(req.params.productId);
  if (!product) return next(new ErrorResponse('Product not found', 404));

  // Check if already reviewed
  const existingReview = await Review.findOne({
    product: req.params.productId,
    user: req.user._id,
  });
  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this product', 400));
  }

  // Check if verified purchase
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'items.product': req.params.productId,
    status: 'delivered',
  });

  const review = await Review.create({
    product: req.params.productId,
    user: req.user._id,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!hasPurchased,
  });

  await review.populate('user', 'name avatar');

  res.status(201).json({ success: true, message: 'Review submitted', review });
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorResponse('Review not found', 404));

  if (review.user.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  const { rating, title, comment } = req.body;
  Object.assign(review, { rating, title, comment });
  await review.save();

  res.status(200).json({ success: true, message: 'Review updated', review });
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorResponse('Review not found', 404));

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }

  await review.deleteOne();
  res.status(200).json({ success: true, message: 'Review deleted' });
};

// @desc    Toggle hide review (admin)
// @route   PUT /api/reviews/:id/hide
// @access  Admin
export const toggleHideReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorResponse('Review not found', 404));

  review.isHidden = !review.isHidden;
  await review.save();

  res.status(200).json({
    success: true,
    message: `Review ${review.isHidden ? 'hidden' : 'visible'}`,
    review,
  });
};

// @desc    Get all reviews (admin)
// @route   GET /api/reviews
// @access  Admin
export const getAllReviews = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.hidden === 'true') filter.isHidden = true;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'title')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), reviews });
};
