const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// @route GET /api/cart
const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name images price discountPrice slug variants isActive',
  });

  if (!cart) {
    const newCart = await Cart.create({ user: req.user._id, items: [] });
    return res.json({ success: true, cart: newCart });
  }

  // Remove items with deleted/inactive products
  cart.items = cart.items.filter((item) => item.product && item.product.isActive);
  await cart.save();

  res.json({ success: true, cart });
};

// @route POST /api/cart/add
const addToCart = async (req, res) => {
  const { productId, quantity = 1, size, color } = req.body;
  if (!productId || !size || !color) {
    return res.status(400).json({ success: false, message: 'Product, size, and color required' });
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const variant = product.variants.find((v) => v.size === size && v.color === color);
  if (!variant) {
    return res.status(400).json({ success: false, message: 'Variant not available' });
  }
  if (variant.stock < quantity) {
    return res.status(400).json({ success: false, message: 'Insufficient stock' });
  }

  const price = product.discountPrice || product.price;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.size === size &&
      item.color === color
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity), size, color, price });
  }

  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name images price discountPrice slug' });
  res.json({ success: true, message: 'Added to cart', cart });
};

// @route PUT /api/cart/update/:itemId
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  if (quantity <= 0) {
    cart.items.pull(req.params.itemId);
  } else {
    item.quantity = Number(quantity);
  }

  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name images price discountPrice slug' });
  res.json({ success: true, cart });
};

// @route DELETE /api/cart/remove/:itemId
const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  cart.items.pull(req.params.itemId);
  await cart.save();
  res.json({ success: true, message: 'Item removed from cart' });
};

// @route DELETE /api/cart/clear
const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: {} });
  res.json({ success: true, message: 'Cart cleared' });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
