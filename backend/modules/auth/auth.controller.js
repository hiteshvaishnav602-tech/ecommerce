import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../users/user.model.js';
import Cart from '../cart/cart.model.js';
import Wishlist from '../wishlist/wishlist.model.js';
import ErrorResponse from '../../shared/utils/errorResponse.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from './emailService.js';

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  res.status(statusCode).json({
    success: true,
    message,
    token,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  const user = await User.create({ name, email, password, phone });

  // Create empty cart and wishlist
  await Cart.create({ user: user._id, items: [] });
  await Wishlist.create({ user: user._id, products: [] });

  // Send welcome email (async, non-blocking)
  sendWelcomeEmail(user.email, user.name);

  sendTokenResponse(user, 201, res, 'Registration successful! Welcome to Aura 🎉');
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  // Trim whitespace to prevent accidental copy-paste errors
  email = email.trim().toLowerCase();
  password = password.trim();

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  if (user.isBlocked) {
    return next(new ErrorResponse('Account blocked. Contact support.', 403));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful');
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).json({ success: true, user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  const { name, phone, gender, dateOfBirth } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, gender, dateOfBirth },
    { new: true, runValidators: true }
  );
  res.status(200).json({ success: true, message: 'Profile updated', user });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully' });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('No account found with this email', 404));
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired reset token', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
};

// @desc    Add address
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
};

// @desc    Update address
// @route   PUT /api/auth/addresses/:id
// @access  Private
export const updateAddress = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);

  if (!address) return next(new ErrorResponse('Address not found', 404));

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({ success: true, message: 'Address updated', addresses: user.addresses });
};

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
export const deleteAddress = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);
  await user.save();
  res.status(200).json({ success: true, message: 'Address deleted', addresses: user.addresses });
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return next(new ErrorResponse('Refresh token required', 400));

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new ErrorResponse('User not found', 401));
    const token = user.generateAuthToken();
    res.status(200).json({ success: true, token });
  } catch (e) {
    return next(new ErrorResponse('Invalid refresh token', 401));
  }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google-login
// @access  Public
export const googleLogin = async (req, res, next) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return next(new ErrorResponse('Please provide Google access token', 400));
  }

  try {
    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    if (!googleRes.ok) {
      return next(new ErrorResponse('Invalid Google token', 400));
    }
    const userData = await googleRes.json();
    const { email, name, picture } = userData;

    if (!email) {
      return next(new ErrorResponse('Google account does not provide an email', 400));
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user with a random password
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: randomPassword,
        avatar: { url: picture || '' }
      });

      // Create empty cart and wishlist
      await Cart.create({ user: user._id, items: [] });
      await Wishlist.create({ user: user._id, products: [] });

      // Send welcome email (async, non-blocking)
      sendWelcomeEmail(user.email, user.name);
    } else {
      if (user.isBlocked) {
        return next(new ErrorResponse('Account blocked. Contact support.', 403));
      }
      // Update avatar if not present
      if (!user.avatar?.url && picture) {
        user.avatar = { url: picture };
      }
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Google login successful');
  } catch (error) {
    console.error('Google OAuth Error:', error);
    return next(new ErrorResponse('Google OAuth failed. Please try again.', 500));
  }
};
