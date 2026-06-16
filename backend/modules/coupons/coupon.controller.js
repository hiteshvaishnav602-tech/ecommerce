import Coupon from './coupon.model.js';
import ErrorResponse from '../../shared/utils/errorResponse.js';

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Admin
export const getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt').lean();
  res.status(200).json({ success: true, coupons });
};

// @desc    Validate coupon (user)
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res, next) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return next(new ErrorResponse('Invalid coupon code', 404));

  const validity = coupon.isValid(req.user._id, orderAmount);
  if (!validity.valid) return next(new ErrorResponse(validity.message, 400));

  const discount = coupon.calculateDiscount(orderAmount);
  res.status(200).json({
    success: true,
    coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
    discount,
  });
};

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Admin
export const createCoupon = async (req, res, next) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, message: 'Coupon created', coupon });
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Admin
export const updateCoupon = async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) return next(new ErrorResponse('Coupon not found', 404));
  res.status(200).json({ success: true, message: 'Coupon updated', coupon });
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
export const deleteCoupon = async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return next(new ErrorResponse('Coupon not found', 404));
  res.status(200).json({ success: true, message: 'Coupon deleted' });
};
