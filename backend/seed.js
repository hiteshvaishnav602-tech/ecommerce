import 'dotenv/config';
import mongoose from 'mongoose';
import User from './modules/users/user.model.js';
import Category from './modules/categories/category.model.js';
import Product from './modules/products/product.model.js';
import Banner from './modules/banners/banner.model.js';
import Coupon from './modules/coupons/coupon.model.js';
import Cart from './modules/cart/cart.model.js';
import Wishlist from './modules/wishlist/wishlist.model.js';
import connectDB from './config/db.js';

const seed = async () => {
  await connectDB();
  console.log('🌱 Starting seed...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
    Banner.deleteMany({ position: 'drops' }),
  ]);
  console.log('🗑️  Cleared existing data (except other Banners)');

  // Create admin
  const admin = await User.create({
    name: 'Admin Chawk',
    email: process.env.ADMIN_EMAIL || 'admin@chawk.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin',
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create test user
  const user = await User.create({
    name: 'Test User',
    email: 'customer@chawk.com',
    password: 'User@123456',
    role: 'user',
  });
  await Cart.create({ user: user._id, items: [] });
  await Wishlist.create({ user: user._id, products: [] });
  console.log(`✅ Test user created: customer@chawk.com`);



  // Create coupons
  const couponsData = [
    {
      code: 'WELCOME10',
      description: '10% off on your first order',
      discountType: 'percentage',
      discountValue: 10,
      maxDiscountAmount: 200,
      minOrderAmount: 500,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'FLAT100',
      description: 'Flat ₹100 off on orders above ₹999',
      discountType: 'flat',
      discountValue: 100,
      minOrderAmount: 999,
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'SAVE20',
      description: '20% off on orders above ₹1499',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmount: 500,
      minOrderAmount: 1499,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  await Coupon.insertMany(couponsData);
  console.log(`✅ ${couponsData.length} coupons created`);

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📋 Test Credentials:');
  console.log(`   Admin: admin@chawk.com / Admin@123456`);
  console.log(`   User:  customer@chawk.com  / User@123456`);
  console.log('\n🏷️  Test Coupons:');
  console.log('   WELCOME10 | FLAT100 | SAVE20\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
