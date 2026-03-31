const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const { cloudinary } = require('../config/cloudinary');

// @route GET /api/products
const getProducts = async (req, res) => {
  const {
    page = 1, limit = 12, sort = '-createdAt',
    category, gender, minPrice, maxPrice, sizes, colors,
    search, isFeatured, isNewArrival, isBestSeller,
  } = req.query;

  const query = { isActive: true };

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) query.category = cat._id;
  }
  if (gender) query.gender = gender;
  if (minPrice || maxPrice) {
    query.$or = [
      { discountPrice: { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) } },
      { discountPrice: null, price: { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) } },
    ];
  }
  if (sizes) {
    const sizeArr = sizes.split(',');
    query['variants.size'] = { $in: sizeArr };
  }
  if (colors) {
    const colorArr = colors.split(',');
    query['variants.color'] = { $in: colorArr };
  }
  if (search) {
    query.$text = { $search: search };
  }
  if (isFeatured === 'true') query.isFeatured = true;
  if (isNewArrival === 'true') query.isNewArrival = true;
  if (isBestSeller === 'true') query.isBestSeller = true;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select('-reviews');

  res.json({
    success: true,
    products,
    pagination: {
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
      limit: Number(limit),
    },
  });
};

// @route GET /api/products/:slug
const getProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug')
    .populate('reviews.user', 'name avatar');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
};

// @route POST /api/products  [Admin]
const createProduct = async (req, res) => {
  const {
    name, description, shortDescription, price, discountPrice,
    category, brand, tags, variants, isFeatured, isNewArrival,
    isBestSeller, material, careInstructions, gender, sizes, colors,
    metaTitle, metaDescription,
  } = req.body;

  // Generate slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

  // Handle uploaded images
  const images = req.files
    ? req.files.map((f) => ({ url: f.path, public_id: f.filename }))
    : [];

  const product = await Product.create({
    name, slug, description, shortDescription,
    price: Number(price), discountPrice: discountPrice ? Number(discountPrice) : undefined,
    images, category, brand, tags: tags ? JSON.parse(tags) : [],
    variants: variants ? JSON.parse(variants) : [],
    isFeatured: isFeatured === 'true', isNewArrival: isNewArrival === 'true',
    isBestSeller: isBestSeller === 'true', material, careInstructions,
    gender, sizes: sizes ? JSON.parse(sizes) : [],
    colors: colors ? JSON.parse(colors) : [],
    metaTitle, metaDescription,
  });

  res.status(201).json({ success: true, message: 'Product created', product });
};

// @route PUT /api/products/:id  [Admin]
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const updates = { ...req.body };
  if (updates.tags && typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);
  if (updates.variants && typeof updates.variants === 'string') updates.variants = JSON.parse(updates.variants);
  if (updates.sizes && typeof updates.sizes === 'string') updates.sizes = JSON.parse(updates.sizes);
  if (updates.colors && typeof updates.colors === 'string') updates.colors = JSON.parse(updates.colors);
  if (updates.price) updates.price = Number(updates.price);
  if (updates.discountPrice) updates.discountPrice = Number(updates.discountPrice);

  if (req.files?.length > 0) {
    const newImages = req.files.map((f) => ({ url: f.path, public_id: f.filename }));
    updates.images = [...product.images, ...newImages];
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json({ success: true, message: 'Product updated', product: updated });
};

// @route DELETE /api/products/:id  [Admin]
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  // Delete images from cloudinary
  for (const img of product.images) {
    if (img.public_id) {
      await cloudinary.uploader.destroy(img.public_id);
    }
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
};

// @route DELETE /api/products/:id/images/:publicId  [Admin]
const deleteProductImage = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  await cloudinary.uploader.destroy(req.params.publicId);
  product.images = product.images.filter((img) => img.public_id !== req.params.publicId);
  await product.save();
  res.json({ success: true, message: 'Image deleted', images: product.images });
};

// @route POST /api/products/:id/reviews
const addReview = async (req, res) => {
  const { rating, comment, title } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: 'Already reviewed this product' });
  }

  product.reviews.push({ user: req.user._id, rating: Number(rating), comment, title });
  await product.save();
  res.status(201).json({ success: true, message: 'Review added' });
};

// @route GET /api/products/admin/all  [Admin]
const adminGetAllProducts = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, products, pagination: { page: Number(page), pages: Math.ceil(total / limit), total } });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, deleteProductImage, addReview, adminGetAllProducts };
