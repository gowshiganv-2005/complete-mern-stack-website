const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const { sendOrderConfirmationEmail } = require('../utils/emailUtils');

// @route POST /api/orders
const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod = 'cod', notes } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  // Build order items & verify stock
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      return res.status(400).json({ success: false, message: `Product ${item.product} is unavailable` });
    }
    const variant = product.variants.find(
      (v) => v.size === item.size && v.color === item.color
    );
    if (!variant || variant.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name} (${item.size}/${item.color})`,
      });
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price,
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCost + tax;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentInfo: { method: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'pending' },
    pricing: { subtotal, shippingCost, tax, total },
    status: 'confirmed',
    notes,
  });

  // Decrement stock
  for (const item of cart.items) {
    await Product.updateOne(
      { _id: item.product._id, 'variants.size': item.size, 'variants.color': item.color },
      { $inc: { 'variants.$.stock': -item.quantity, soldCount: item.quantity } }
    );
  }

  // Clear cart
  cart.items = [];
  cart.coupon = {};
  await cart.save();

  const populated = await order.populate('user', 'name email');
  try { await sendOrderConfirmationEmail(req.user, order); } catch (e) {}

  res.status(201).json({ success: true, message: 'Order placed successfully', order });
};

// @route GET /api/orders/my
const getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select('-items.product');
  res.json({ success: true, orders, pagination: { page: Number(page), pages: Math.ceil(total / limit), total } });
};

// @route GET /api/orders/:id
const getOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    .populate('items.product', 'name images slug');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
};

// @route PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!['pending', 'confirmed'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
  }
  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || 'Cancelled by user';
  // Restore stock
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, 'variants.size': item.size, 'variants.color': item.color },
      { $inc: { 'variants.$.stock': item.quantity, soldCount: -item.quantity } }
    );
  }
  await order.save();
  res.json({ success: true, message: 'Order cancelled', order });
};

// ---- ADMIN ----

// @route GET /api/admin/orders
const adminGetOrders = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.orderNumber = { $regex: search, $options: 'i' };
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, orders, pagination: { page: Number(page), pages: Math.ceil(total / limit), total } });
};

// @route PUT /api/admin/orders/:id/status
const adminUpdateOrderStatus = async (req, res) => {
  const { status, trackingNumber, estimatedDelivery } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status, ...(trackingNumber && { trackingNumber }), ...(estimatedDelivery && { estimatedDelivery }), ...(status === 'delivered' && { deliveredAt: new Date() }) },
    { new: true }
  ).populate('user', 'name email');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, message: 'Order status updated', order });
};

// @route GET /api/admin/dashboard
const adminDashboard = async (req, res) => {
  const User = require('../models/userModel');
  const [
    totalOrders, totalRevenue, totalUsers, totalProducts,
    recentOrders, ordersByStatus
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { 'paymentInfo.status': 'paid' } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      totalProducts,
    },
    recentOrders,
    ordersByStatus,
  });
};

module.exports = { createOrder, getMyOrders, getOrder, cancelOrder, adminGetOrders, adminUpdateOrderStatus, adminDashboard };
