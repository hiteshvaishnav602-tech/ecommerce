import Banner from './banner.model.js';
import ErrorResponse from '../../shared/utils/errorResponse.js';
import { uploadStreamToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';

// @desc    Get active banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res) => {
  const filter = { isActive: true };
  if (req.query.position) filter.position = req.query.position;

  const banners = await Banner.find(filter).sort('order').lean();
  res.status(200).json({ success: true, banners });
};

// @desc    Get all banners (admin)
// @route   GET /api/banners/all
// @access  Admin
export const getAllBanners = async (req, res) => {
  const banners = await Banner.find().sort('order').lean();
  res.status(200).json({ success: true, banners });
};

// @desc    Create banner
// @route   POST /api/banners
// @access  Admin
export const createBanner = async (req, res, next) => {
  let image = { url: '', public_id: '' };
  if (req.file) {
    const result = await uploadStreamToCloudinary(req.file.buffer, 'aura/banners');
    image = { url: result.url, public_id: result.public_id };
  }
  const banner = await Banner.create({ ...req.body, image });
  res.status(201).json({ success: true, message: 'Banner created', banner });
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Admin
export const updateBanner = async (req, res, next) => {
  let banner = await Banner.findById(req.params.id);
  if (!banner) return next(new ErrorResponse('Banner not found', 404));

  const updateData = { ...req.body };
  if (req.file) {
    if (banner.image?.public_id) await deleteFromCloudinary(banner.image.public_id);
    const result = await uploadStreamToCloudinary(req.file.buffer, 'aura/banners');
    updateData.image = { url: result.url, public_id: result.public_id };
  }

  banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.status(200).json({ success: true, message: 'Banner updated', banner });
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Admin
export const deleteBanner = async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return next(new ErrorResponse('Banner not found', 404));
  if (banner.image?.public_id) await deleteFromCloudinary(banner.image.public_id);
  await banner.deleteOne();
  res.status(200).json({ success: true, message: 'Banner deleted' });
};

// @desc    Toggle banner active status
// @route   PUT /api/banners/:id/toggle
// @access  Admin
export const toggleBanner = async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return next(new ErrorResponse('Banner not found', 404));

  banner.isActive = !banner.isActive;
  await banner.save();
  
  res.status(200).json({ success: true, message: 'Banner status toggled', banner });
};
