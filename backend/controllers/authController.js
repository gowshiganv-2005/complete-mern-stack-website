const crypto = require('crypto');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const { generateTokens } = require('../middleware/authMiddleware');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailUtils');

const setCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// @route POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, isVerified: true });
  await Cart.create({ user: user._id, items: [] });

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setCookies(res, accessToken, refreshToken);

  // Send welcome email in background (non-blocking for registration response)
  sendWelcomeEmail(user).catch((e) => console.error('Welcome email failed:', e.message));

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// @route POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account is deactivated' });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  setCookies(res, accessToken, refreshToken);

  // Ensure cart exists
  await Cart.findOneAndUpdate(
    { user: user._id },
    { $setOnInsert: { user: user._id, items: [] } },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    message: 'Login successful',
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// @route POST /api/auth/refresh
const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    setCookies(res, accessToken, newRefreshToken);
    res.json({ success: true, accessToken });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// @route POST /api/auth/logout
const logout = async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }
  } catch (e) {}
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price discountPrice slug');
  res.json({ success: true, user });
};

// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account with this email' });
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, resetToken);
    res.json({ success: true, message: 'Password reset email sent' });
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
};

// @route PUT /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset successful' });
};

// Google OAuth callback handler
const googleCallback = async (req, res) => {
  const { accessToken, refreshToken } = generateTokens(req.user._id);
  req.user.refreshToken = refreshToken;
  req.user.lastLogin = new Date();
  await req.user.save({ validateBeforeSave: false });

  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id, items: [] } },
    { upsert: true }
  );

  setCookies(res, accessToken, refreshToken);
  res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${accessToken}`);
};

module.exports = { register, login, logout, refreshToken, getMe, forgotPassword, resetPassword, googleCallback };
