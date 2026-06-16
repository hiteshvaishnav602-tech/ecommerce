import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { url: String, public_id: String },
    link: { type: String, default: '/' },
    buttonText: { type: String, default: 'Shop Now' },
    position: { type: String, enum: ['hero', 'banner', 'category', 'sidebar', 'promo', 'drops'], default: 'hero' },
    gender: { type: String, enum: ['men', 'women', 'all', 'sneakers'], default: 'all' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    bgColor: { type: String, default: '#1a1a2e' },
    textColor: { type: String, default: '#ffffff' },
  },
  { timestamps: true }
);

export default mongoose.model('Banner', bannerSchema);
