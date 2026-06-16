import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, default: null }, // cap for percentage discounts
    minOrderAmount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    userLimit: { type: Number, default: 1 }, // per user usage limit
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function (userId, orderAmount) {
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (new Date() > this.expiresAt) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit)
    return { valid: false, message: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderAmount)
    return { valid: false, message: `Minimum order amount is ₹${this.minOrderAmount}` };
  const userUsage = this.usedBy.filter((u) => u.toString() === userId.toString()).length;
  if (userUsage >= this.userLimit)
    return { valid: false, message: 'You have already used this coupon' };
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (amount) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (amount * this.discountValue) / 100;
    if (this.maxDiscountAmount) discount = Math.min(discount, this.maxDiscountAmount);
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, amount);
};

export default mongoose.model('Coupon', couponSchema);
