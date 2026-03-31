const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createOrder, getMyOrders, getOrder, cancelOrder,
  adminGetOrders, adminUpdateOrderStatus, adminDashboard,
} = require('../controllers/orderController');

// User routes
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/admin/all', protect, adminOnly, adminGetOrders);
router.get('/admin/dashboard', protect, adminOnly, adminDashboard);
router.put('/admin/:id/status', protect, adminOnly, adminUpdateOrderStatus);

module.exports = router;
