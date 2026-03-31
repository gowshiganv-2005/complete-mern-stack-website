const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getProfile, updateProfile, changePassword,
  addAddress, updateAddress, deleteAddress,
  toggleWishlist, adminGetUsers, adminUpdateUser, adminDeleteUser,
} = require('../controllers/userController');

// User routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);

// Admin routes
router.get('/admin', protect, adminOnly, adminGetUsers);
router.put('/admin/:id', protect, adminOnly, adminUpdateUser);
router.delete('/admin/:id', protect, adminOnly, adminDeleteUser);

module.exports = router;
