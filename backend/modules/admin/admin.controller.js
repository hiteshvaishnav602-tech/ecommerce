import User from '../users/user.model.js';
import Product from '../products/product.model.js';
import Order from '../orders/order.model.js';
import Review from '../reviews/review.model.js';
import Category from '../categories/category.model.js';
import ErrorResponse from '../../shared/utils/errorResponse.js';

// @desc    Admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Admin
export const getDashboard = async (req, res) => {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    thisMonthOrders,
    lastMonthOrders,
    recentOrders,
    topProducts,
    monthlySales,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ createdAt: { $gte: thisMonth } }),
    Order.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
    Order.find().populate('user', 'name email').sort('-createdAt').limit(10).lean(),
    Product.find({ isActive: true }).sort('-soldCount').limit(5).lean(),
    Order.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  const revenue = totalRevenue[0]?.total || 0;

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      pendingOrders,
      thisMonthOrders,
      lastMonthOrders,
      growth:
         lastMonthOrders > 0
          ? (((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1)
          : 0,
    },
    recentOrders,
    topProducts,
    monthlySales,
  });
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.role) filter.role = req.query.role;

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort('-createdAt').skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), users });
};

// @desc    Update user (admin)
// @route   PUT /api/admin/users/:id
// @access  Admin
export const updateUser = async (req, res, next) => {
  const { role, isBlocked } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, isBlocked },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) return next(new ErrorResponse('User not found', 404));
  res.status(200).json({ success: true, message: 'User updated', user });
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Admin
export const deleteUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (user.role === 'admin') return next(new ErrorResponse('Cannot delete admin user', 403));

  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted' });
};

// @desc    Get sales analytics
// @route   GET /api/admin/analytics
// @access  Admin
export const getAnalytics = async (req, res) => {
  const [ordersByStatus, revenueByCategory, dailySales] = await Promise.all([
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),
    Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]),
  ]);

  res.status(200).json({ success: true, ordersByStatus, revenueByCategory, dailySales });
};
