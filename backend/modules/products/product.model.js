import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: { type: String, unique: true },
    brand: { type: String, default: 'Bewakoof' },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
        alt: { type: String, default: '' },
      },
    ],
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    discountPercent: { type: Number, default: 0 },
    sizes: [
      {
        size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'] },
        stock: { type: Number, default: 0 },
      },
    ],
    colors: [
      {
        name: { type: String },
        hex: { type: String },
        isDefault: { type: Boolean, default: false },
        image: {
          url: { type: String },
          public_id: { type: String }
        },
        images: [
          {
            url: { type: String, required: true },
            public_id: { type: String }
          }
        ]
      },
    ],
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    tags: [{ type: String }],
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    gender: { type: String, enum: ['men', 'women', 'unisex', 'kids', 'sneakers'], default: 'unisex' },
    material: { type: String, default: '' },
    fit: { type: String, default: '' },
    careInstructions: { type: String, default: '' },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create slug from title
productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  
  // If discountPrice is not set, default it to price
  if (this.discountPrice === undefined || this.discountPrice === null || this.discountPrice === 0) {
    this.discountPrice = this.price;
  }

  // Calculate discount percent
  if (this.discountPrice && this.price) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  } else {
    this.discountPercent = 0;
  }
  next();
});

// Index for search
productSchema.index({ title: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, gender: 1, isActive: 1 });
productSchema.index({ price: 1, discountPrice: 1 });
productSchema.index({ ratings: -1, soldCount: -1 });

export default mongoose.model('Product', productSchema);
