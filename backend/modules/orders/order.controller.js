import Order from './order.model.js';
import Cart from '../cart/cart.model.js';
import Product from '../products/product.model.js';
import Coupon from '../coupons/coupon.model.js';
import ErrorResponse from '../../shared/utils/errorResponse.js';
import { sendOrderConfirmationEmail } from '../auth/emailService.js';

const SHIPPING_THRESHOLD = 499; // Free shipping above this amount
const SHIPPING_CHARGE = 49;

// @desc    Create order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  // Get cart
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'title images price discountPrice stock sizes colors isActive'
  );

  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('Your cart is empty', 400));
  }

  // Build order items and validate stock
  const orderItems = [];
  let itemsTotal = 0;

  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      return next(new ErrorResponse(`Product is no longer available`, 400));
    }
    
    // Check main stock
    if (item.product.stock < item.quantity) {
      return next(
        new ErrorResponse(`Insufficient stock for "${item.product.title}"`, 400)
      );
    }

    // Check size variant stock if sizes exist
    if (item.product.sizes && item.product.sizes.length > 0) {
      if (!item.size) {
        return next(
          new ErrorResponse(`Please select a size for "${item.product.title}"`, 400)
        );
      }
      const sizeOption = item.product.sizes.find(s => s.size === item.size);
      if (!sizeOption || sizeOption.stock < item.quantity) {
        return next(
          new ErrorResponse(
            `Insufficient stock for size "${item.size}" of "${item.product.title}"`,
            400
          )
        );
      }
    }

    const price = item.product.discountPrice || item.product.price;
    const thumbnailImage = item.product.images?.[0]?.url || item.product.colors?.[0]?.images?.[0]?.url || item.product.colors?.[0]?.image?.url || '';
    orderItems.push({
      product: item.product._id,
      title: item.product.title,
      image: thumbnailImage,
      price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    });
    itemsTotal += price * item.quantity;
  }

  // Shipping
  const shippingCharge = itemsTotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

  // Coupon
  let couponDiscount = 0;
  let couponDoc = null;
  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (couponDoc) {
      const validity = couponDoc.isValid(req.user._id, itemsTotal);
      if (validity.valid) {
        couponDiscount = couponDoc.calculateDiscount(itemsTotal);
      }
    }
  } else if (cart.coupon) {
    couponDoc = await Coupon.findById(cart.coupon);
    if (couponDoc) {
      couponDiscount = cart.couponDiscount || 0;
    }
  }

  const totalAmount = itemsTotal + shippingCharge - couponDiscount;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsTotal,
    shippingCharge,
    couponDiscount,
    totalAmount,
    coupon: couponDoc ? couponDoc._id : null,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  // Deduct stock
  for (const item of orderItems) {
    if (item.size) {
      await Product.updateOne(
        { _id: item.product, 'sizes.size': item.size },
        { $inc: { 'sizes.$.stock': -item.quantity } }
      );
    }
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // Update coupon usage
  if (couponDoc) {
    couponDoc.usedCount += 1;
    couponDoc.usedBy.push(req.user._id);
    await couponDoc.save();
  }

  // Clear cart if payment is COD (for Razorpay, clear after payment verification)
  if (paymentMethod === 'cod') {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], coupon: null, couponDiscount: 0 }
    );
    // Send confirmation email (async, don't block)
    try {
      await sendOrderConfirmationEmail(req.user.email, req.user.name, order);
    } catch (error) {
      console.error('❌ COD Order confirmation email failed:', error.message);
    }
  }

  res.status(201).json({
    success: true,
    message: paymentMethod === 'cod' ? 'Order placed successfully!' : 'Order created',
    order,
  });
};

// @desc    Get my orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    orders,
  });
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('coupon', 'code discountType discountValue');

  if (!order) return next(new ErrorResponse('Order not found', 404));

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view this order', 403));
  }

  res.status(200).json({ success: true, order });
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorResponse('Order not found', 404));
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  if (['shipped', 'delivered'].includes(order.status)) {
    return next(new ErrorResponse('Cannot cancel a shipped or delivered order', 400));
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = req.body.reason || 'Cancelled by user';
  order.statusHistory.push({ status: 'cancelled', note: order.cancellationReason });

  // Restore stock
  for (const item of order.items) {
    if (item.size) {
      await Product.updateOne(
        { _id: item.product, 'sizes.size': item.size },
        { $inc: { 'sizes.$.stock': item.quantity } }
      );
    }
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  await order.save();
  res.status(200).json({ success: true, message: 'Order cancelled', order });
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), orders });
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res, next) => {
  const { status, note, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorResponse('Order not found', 404));

  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[order.status].includes(status)) {
    return next(new ErrorResponse(`Cannot transition from ${order.status} to ${status}`, 400));
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || '' });

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = 'paid';
  }
  if (status === 'shipped' && trackingNumber) {
    order.trackingNumber = trackingNumber;
  }
  if (status === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancellationReason = note || 'Cancelled by admin';
    for (const item of order.items) {
      if (item.size) {
        await Product.updateOne(
          { _id: item.product, 'sizes.size': item.size },
          { $inc: { 'sizes.$.stock': item.quantity } }
        );
      }
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }
  }

  await order.save();
  res.status(200).json({ success: true, message: `Order status updated to ${status}`, order });
};
