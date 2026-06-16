import { createRazorpayOrder, verifyPaymentSignature, getRazorpayKey as getServiceRazorpayKey } from './paymentService.js';
import Order from '../orders/order.model.js';
import Cart from '../cart/cart.model.js';
import ErrorResponse from '../../shared/utils/errorResponse.js';
import { sendOrderConfirmationEmail } from '../auth/emailService.js';

// @desc    Get Razorpay key
// @route   GET /api/payment/key
// @access  Public
export const getRazorpayKey = (req, res) => {
  res.status(200).json({ success: true, key: getServiceRazorpayKey() });
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createPaymentOrder = async (req, res, next) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) return next(new ErrorResponse('Order not found', 404));
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  const razorpayOrder = await createRazorpayOrder(
    order.totalAmount,
    'INR',
    order.orderNumber
  );

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.status(200).json({
    success: true,
    razorpayOrder,
    order: { _id: order._id, totalAmount: order.totalAmount, orderNumber: order.orderNumber },
  });
};

// @desc    Verify payment and confirm order
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    return next(new ErrorResponse('Payment verification failed. Invalid signature.', 400));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorResponse('Order not found', 404));

  order.paymentStatus = 'paid';
  order.paymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  order.status = 'processing';
  order.statusHistory.push({ status: 'processing', note: 'Payment confirmed' });
  await order.save();

  // Clear cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], coupon: null, couponDiscount: 0 }
  );

  // Send email (async, non-blocking)
  sendOrderConfirmationEmail(req.user.email, req.user.name, order);

  res.status(200).json({ success: true, message: 'Payment verified. Order confirmed! 🎉', order });
};
