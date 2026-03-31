const User = require('../models/userModel');

// @route GET /api/users/profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price discountPrice slug');
  res.json({ success: true, user });
};

// @route PUT /api/users/profile
const updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (req.file) updates.avatar = req.file.path;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ success: true, message: 'Profile updated', user });
};

// @route PUT /api/users/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user.password) {
    return res.status(400).json({ success: false, message: 'Use Google login for this account' });
  }
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
};

// @route POST /api/users/addresses
const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
};

// @route PUT /api/users/addresses/:id
const updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);
  if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  Object.assign(address, req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
};

// @route DELETE /api/users/addresses/:id
const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull(req.params.id);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
};

// @route POST /api/users/wishlist/:productId
const toggleWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const exists = user.wishlist.includes(productId);
  if (exists) {
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  } else {
    user.wishlist.push(productId);
  }
  await user.save();
  res.json({ success: true, message: exists ? 'Removed from wishlist' : 'Added to wishlist', inWishlist: !exists });
};

// ---- ADMIN ----

// @route GET /api/admin/users
const adminGetUsers = async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  if (role) query.role = role;
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)).select('-password -refreshToken -resetPasswordToken');
  res.json({ success: true, users, pagination: { page: Number(page), pages: Math.ceil(total / limit), total } });
};

// @route PUT /api/admin/users/:id
const adminUpdateUser = async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(role && { role }), ...(isActive !== undefined && { isActive }) },
    { new: true }
  );
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

// @route DELETE /api/admin/users/:id
const adminDeleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
};

module.exports = {
  getProfile, updateProfile, changePassword,
  addAddress, updateAddress, deleteAddress,
  toggleWishlist, adminGetUsers, adminUpdateUser, adminDeleteUser,
};
