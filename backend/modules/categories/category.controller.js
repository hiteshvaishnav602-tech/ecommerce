import Category from './category.model.js';
import Product from '../products/product.model.js';
import ErrorResponse from '../../shared/utils/errorResponse.js';
import { uploadStreamToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort('order name')
    .lean();
  res.status(200).json({ success: true, categories });
};

// @desc    Get all categories (admin, includes inactive)
// @route   GET /api/categories/all
// @access  Admin
export const getAllCategories = async (req, res) => {
  const categories = await Category.find().sort('order name').lean();
  res.status(200).json({ success: true, categories });
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = async (req, res, next) => {
  const category = await Category.findOne({
    $or: [
      { _id: req.params.id.match(/^[a-fA-F0-9]{24}$/) ? req.params.id : null },
      { slug: req.params.id },
    ],
  });
  if (!category) return next(new ErrorResponse('Category not found', 404));
  res.status(200).json({ success: true, category });
};

// @desc    Create category
// @route   POST /api/categories
// @access  Admin
export const createCategory = async (req, res, next) => {
  let image = { url: '', public_id: '' };

  if (req.file) {
    const result = await uploadStreamToCloudinary(req.file.buffer, 'aura/categories');
    image = { url: result.url, public_id: result.public_id };
  }

  const category = await Category.create({ ...req.body, image });
  res.status(201).json({ success: true, message: 'Category created', category });
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
export const updateCategory = async (req, res, next) => {
  let category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorResponse('Category not found', 404));

  const updateData = { ...req.body };

  if (req.file) {
    if (category.image.public_id) await deleteFromCloudinary(category.image.public_id);
    const result = await uploadStreamToCloudinary(req.file.buffer, 'aura/categories');
    updateData.image = { url: result.url, public_id: result.public_id };
  }

  category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, message: 'Category updated', category });
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
export const deleteCategory = async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorResponse('Category not found', 404));

  // Unlink all products from this category
  await Product.updateMany({ category: category._id }, { $unset: { category: "" } });

  if (category.image.public_id) await deleteFromCloudinary(category.image.public_id);
  await category.deleteOne();

  res.status(200).json({ success: true, message: 'Category deleted successfully' });
};
