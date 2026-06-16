import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
    image: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    gender: { type: String, enum: ['men', 'women', 'unisex', 'kids', 'all', 'sneakers'], default: 'all' },
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  if (this.isModified('name') || this.isModified('gender')) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    if (this.gender && this.gender !== 'all' && this.gender !== 'unisex') {
      this.slug = `${baseSlug}-${this.gender}`;
    } else {
      this.slug = baseSlug;
    }
  }
  next();
});

export default mongoose.model('Category', categorySchema);
