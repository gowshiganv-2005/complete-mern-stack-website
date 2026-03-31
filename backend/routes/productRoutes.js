const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  deleteProductImage, addReview, adminGetAllProducts,
} = require('../controllers/productController');

// Public
router.get('/', getProducts);
router.get('/admin/all', protect, adminOnly, adminGetAllProducts);
router.get('/:slug', getProduct);

// Protected
router.post('/:id/reviews', protect, addReview);

// Admin
router.post('/', protect, adminOnly, upload.array('images', 8), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 8), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.delete('/:id/images/:publicId', protect, adminOnly, deleteProductImage);

module.exports = router;
