import Product from './product.model.js';
import Category from '../categories/category.model.js';
import Cart from '../cart/cart.model.js';
import Wishlist from '../wishlist/wishlist.model.js';
import ErrorResponse from '../../shared/utils/errorResponse.js';
import APIFeatures from '../../shared/utils/apiFeatures.js';
import { uploadStreamToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  let query = Product.find({ isActive: true }).populate('category', 'name slug');

  // Manual filtering beyond APIFeatures
  const {
    keyword, category, minPrice, maxPrice, color, size,
    rating, gender, sort, page = 1, limit = 12,
    featured, trending, newArrival, bestSeller
  } = req.query;

  let filterObj = { isActive: true };

  if (keyword) {
    const matchingCategories = await Category.find({ name: { $regex: keyword, $options: 'i' } });
    const categoryIds = matchingCategories.map(c => c._id);

    filterObj.$or = [
      { title:       { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { tags:        { $elemMatch: { $regex: keyword, $options: 'i' } } },
      { brand:       { $regex: keyword, $options: 'i' } },
    ];
    
    if (categoryIds.length > 0) {
      filterObj.$or.push({ category: { $in: categoryIds } });
    }
  }

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filterObj.category = cat._id;
  }

  if (minPrice || maxPrice) {
    filterObj.discountPrice = {};
    if (minPrice) filterObj.discountPrice.$gte = Number(minPrice);
    if (maxPrice) filterObj.discountPrice.$lte = Number(maxPrice);
  }

  if (color) filterObj['colors.name'] = { $regex: color, $options: 'i' };
  if (size) filterObj['sizes.size'] = size.toUpperCase();
  if (rating) filterObj.ratings = { $gte: Number(rating) };
  if (gender) filterObj.gender = gender;
  if (featured === 'true') filterObj.isFeatured = true;
  if (trending === 'true') filterObj.isTrending = true;
  if (newArrival === 'true') filterObj.isNewArrival = true;
  if (bestSeller === 'true') filterObj.isBestSeller = true;

  let sortObj = { createdAt: -1 };
  if (sort === 'price-asc') sortObj = { discountPrice: 1 };
  else if (sort === 'price-desc') sortObj = { discountPrice: -1 };
  else if (sort === 'popular') sortObj = { soldCount: -1, ratings: -1 };
  else if (sort === 'rating') sortObj = { ratings: -1 };
  else if (sort === 'newest') sortObj = { createdAt: -1 };

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filterObj)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filterObj),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum),
    products,
  });
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id.match(/^[a-fA-F0-9]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
    isActive: true,
  }).populate('category', 'name slug');

  if (!product) return next(new ErrorResponse('Product not found', 404));

  res.status(200).json({ success: true, product });
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res, next) => {
  const body = { ...req.body };
  if (body.sizes && typeof body.sizes === 'string') body.sizes = JSON.parse(body.sizes);
  if (body.colors && typeof body.colors === 'string') body.colors = JSON.parse(body.colors);
  if (body.tags && typeof body.tags === 'string') body.tags = JSON.parse(body.tags);

  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadStreamToCloudinary(file.buffer, 'aura/products');
      images.push({ url: result.url, public_id: result.public_id });
    }
  } else if (body.images) {
    const parsedImages = typeof body.images === 'string' ? JSON.parse(body.images) : body.images;
    images.push(...parsedImages);
  }

  const product = await Product.create({ ...body, images });
  res.status(201).json({ success: true, message: 'Product created', product });
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorResponse('Product not found', 404));

  const body = { ...req.body };
  if (body.sizes && typeof body.sizes === 'string') body.sizes = JSON.parse(body.sizes);
  if (body.colors && typeof body.colors === 'string') body.colors = JSON.parse(body.colors);
  if (body.tags && typeof body.tags === 'string') body.tags = JSON.parse(body.tags);
  if (body.images && typeof body.images === 'string') body.images = JSON.parse(body.images);

  if (req.files && req.files.length > 0) {
    const newImages = [];
    for (const file of req.files) {
      const result = await uploadStreamToCloudinary(file.buffer, 'aura/products');
      newImages.push({ url: result.url, public_id: result.public_id });
    }
    const existingImages = body.images || product.images || [];
    body.images = [...existingImages, ...newImages];
  }

  product = await Product.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, message: 'Product updated', product });
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorResponse('Product not found', 404));

  // Delete images from Cloudinary
  for (const img of product.images) {
    if (img.public_id) await deleteFromCloudinary(img.public_id);
  }

  // Remove product from all Carts
  await Cart.updateMany({}, { $pull: { items: { product: req.params.id } } });

  // Remove product from all Wishlists
  await Wishlist.updateMany({}, { $pull: { products: req.params.id } });

  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted' });
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:public_id
// @access  Admin
export const deleteProductImage = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorResponse('Product not found', 404));

  const publicId = decodeURIComponent(req.params.public_id);
  await deleteFromCloudinary(publicId);
  product.images = product.images.filter((img) => img.public_id !== publicId);
  await product.save();

  res.status(200).json({ success: true, message: 'Image deleted', images: product.images });
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(12)
    .lean();
  res.status(200).json({ success: true, products });
};

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
export const getTrendingProducts = async (req, res) => {
  const products = await Product.find({ isActive: true })
    .populate('category', 'name slug')
    .sort({ isTrending: -1, createdAt: -1 })
    .limit(100)
    .lean();
  res.status(200).json({ success: true, products });
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
export const getNewArrivals = async (req, res) => {
  const products = await Product.find({ isNewArrival: true, isActive: true })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(12)
    .lean();
  res.status(200).json({ success: true, products });
};

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
export const getBestSellers = async (req, res) => {
  const products = await Product.find({ isBestSeller: true, isActive: true })
    .populate('category', 'name slug')
    .sort('-soldCount')
    .limit(12)
    .lean();
  res.status(200).json({ success: true, products });
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorResponse('Product not found', 404));

  const products = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(8)
    .lean();

  res.status(200).json({ success: true, products });
};

// @desc    Upload single image to Cloudinary
// @route   POST /api/products/upload-image
// @access  Admin
export const uploadImage = async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }
  try {
    const result = await uploadStreamToCloudinary(req.file.buffer, 'aura/products');
    res.status(200).json({
      success: true,
      url: result.url,
      public_id: result.public_id,
    });
  } catch (err) {
    return next(new ErrorResponse('Image upload failed', 500));
  }
};
