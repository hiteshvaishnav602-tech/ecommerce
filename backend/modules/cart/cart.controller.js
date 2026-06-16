import Cart from './cart.model.js';
import Product from '../products/product.model.js';
import Coupon from '../coupons/coupon.model.js';
import ErrorResponse from '../../shared/utils/errorResponse.js';

const populateCart = (query) =>
  query.populate('items.product', 'title images price discountPrice stock sizes colors isActive');

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  let cart = await populateCart(Cart.findOne({ user: req.user._id }).populate('coupon'));

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Remove items where product is deleted/inactive
  cart.items = cart.items.filter(
    (item) => item.product && item.product.isActive !== false
  );

  res.status(200).json({ success: true, cart });
};

// @desc    Add to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  const { productId, quantity = 1, size = '', color = '' } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new ErrorResponse('Product not found or unavailable', 404));
  }

  if (product.stock < quantity) {
    return next(new ErrorResponse(`Only ${product.stock} items in stock`, 400));
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.size === size &&
      item.color === color
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      size,
      color,
      price: product.discountPrice || product.price,
    });
  }

  await cart.save();
  cart = await populateCart(Cart.findById(cart._id));

  res.status(200).json({ success: true, message: 'Added to cart', cart });
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) return next(new ErrorResponse('Cart not found', 404));

  const item = cart.items.id(req.params.itemId);
  if (!item) return next(new ErrorResponse('Cart item not found', 404));

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  const updatedCart = await populateCart(Cart.findById(cart._id));

  res.status(200).json({ success: true, message: 'Cart updated', cart: updatedCart });
};

// @desc    Remove cart item
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ErrorResponse('Cart not found', 404));

  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();

  const updatedCart = await populateCart(Cart.findById(cart._id));
  res.status(200).json({ success: true, message: 'Item removed', cart: updatedCart });
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ErrorResponse('Cart not found', 404));

  cart.items = [];
  cart.coupon = null;
  cart.couponDiscount = 0;
  await cart.save();

  res.status(200).json({ success: true, message: 'Cart cleared' });
};

// @desc    Apply coupon
// @route   POST /api/cart/coupon
// @access  Private
export const applyCoupon = async (req, res, next) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return next(new ErrorResponse('Invalid coupon code', 404));

  const cart = await populateCart(Cart.findOne({ user: req.user._id }));
  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('Your cart is empty', 400));
  }

  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const validity = coupon.isValid(req.user._id, subtotal);

  if (!validity.valid) return next(new ErrorResponse(validity.message, 400));

  const discount = coupon.calculateDiscount(subtotal);
  cart.coupon = coupon._id;
  cart.couponDiscount = discount;
  await cart.save();

  res.status(200).json({
    success: true,
    message: `Coupon applied! You save ₹${discount.toFixed(2)}`,
    discount,
    coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
  });
};

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
// @access  Private
export const removeCoupon = async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ErrorResponse('Cart not found', 404));

  cart.coupon = null;
  cart.couponDiscount = 0;
  await cart.save();

  res.status(200).json({ success: true, message: 'Coupon removed' });
};
