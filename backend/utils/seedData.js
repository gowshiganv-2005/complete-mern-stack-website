require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/luxe_clothing';

const categories = [
  { name: "Women's Tops", slug: 'womens-tops', gender: 'women' },
  { name: "Women's Bottoms", slug: 'womens-bottoms', gender: 'women' },
  { name: "Women's Dresses", slug: 'womens-dresses', gender: 'women' },
  { name: "Men's Shirts", slug: 'mens-shirts', gender: 'men' },
  { name: "Men's Trousers", slug: 'mens-trousers', gender: 'men' },
  { name: "Outerwear", slug: 'outerwear', gender: 'unisex' },
  { name: "Accessories", slug: 'accessories', gender: 'unisex' },
];

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80';
const PLACEHOLDER_IMAGE_2 = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80';

const sampleProducts = [
  {
    name: 'Classic White Oxford Shirt',
    description: 'Timeless Oxford shirt crafted from premium 100% cotton. Perfect for both formal and casual occasions. The relaxed fit provides exceptional comfort throughout the day.',
    shortDescription: 'Premium Oxford cotton shirt for any occasion',
    price: 2499,
    discountPrice: 1999,
    material: '100% Premium Cotton',
    careInstructions: 'Machine wash cold, hang dry',
    gender: 'men',
    isFeatured: true,
    isNewArrival: true,
    tags: ['cotton', 'formal', 'classic', 'shirt'],
    variants: [
      { size: 'S', color: 'White', colorHex: '#FFFFFF', stock: 15 },
      { size: 'M', color: 'White', colorHex: '#FFFFFF', stock: 20 },
      { size: 'L', color: 'White', colorHex: '#FFFFFF', stock: 18 },
      { size: 'XL', color: 'White', colorHex: '#FFFFFF', stock: 10 },
      { size: 'M', color: 'Light Blue', colorHex: '#B0C4DE', stock: 12 },
      { size: 'L', color: 'Light Blue', colorHex: '#B0C4DE', stock: 8 },
    ],
    images: [{ url: PLACEHOLDER_IMAGE_2, altText: 'Classic Oxford Shirt' }],
  },
  {
    name: 'Floral Wrap Midi Dress',
    description: 'Elegant floral wrap dress that flatters every figure. Made from lightweight viscose fabric that drapes beautifully. A wardrobe essential for summer events and brunches.',
    shortDescription: 'Flattering floral wrap dress in lightweight viscose',
    price: 3499,
    discountPrice: 2799,
    material: '100% Viscose',
    careInstructions: 'Hand wash cold, lay flat to dry',
    gender: 'women',
    isFeatured: true,
    isBestSeller: true,
    tags: ['floral', 'summer', 'dress', 'midi'],
    variants: [
      { size: 'XS', color: 'Floral Print', colorHex: '#f97316', stock: 8 },
      { size: 'S', color: 'Floral Print', colorHex: '#f97316', stock: 12 },
      { size: 'M', color: 'Floral Print', colorHex: '#f97316', stock: 10 },
      { size: 'L', color: 'Floral Print', colorHex: '#f97316', stock: 6 },
    ],
    images: [{ url: PLACEHOLDER_IMAGE, altText: 'Floral Wrap Dress' }],
  },
  {
    name: 'Tailored Navy Blazer',
    description: 'Impeccably tailored blazer in classic navy. Constructed from a premium wool blend for structure and comfort. Features two-button closure and dual side pockets.',
    shortDescription: 'Premium wool-blend tailored blazer in navy',
    price: 5999,
    material: '70% Wool, 30% Polyester',
    careInstructions: 'Dry clean only',
    gender: 'men',
    isFeatured: true,
    tags: ['blazer', 'formal', 'wool', 'navy'],
    variants: [
      { size: 'S', color: 'Navy', colorHex: '#1B3A6B', stock: 5 },
      { size: 'M', color: 'Navy', colorHex: '#1B3A6B', stock: 8 },
      { size: 'L', color: 'Navy', colorHex: '#1B3A6B', stock: 7 },
      { size: 'XL', color: 'Navy', colorHex: '#1B3A6B', stock: 4 },
      { size: 'M', color: 'Charcoal', colorHex: '#36454F', stock: 6 },
      { size: 'L', color: 'Charcoal', colorHex: '#36454F', stock: 5 },
    ],
    images: [{ url: PLACEHOLDER_IMAGE_2, altText: 'Navy Blazer' }],
  },
  {
    name: 'High-Rise Slim Trousers',
    description: 'Sophisticated high-rise trousers with a slim silhouette. Made from stretch fabric blend for all-day comfort. Features a clean front and side pockets.',
    shortDescription: 'Sleek high-rise slim trousers in stretch fabric',
    price: 2999,
    discountPrice: 2499,
    material: '65% Polyester, 33% Viscose, 2% Elastane',
    careInstructions: 'Machine wash cold, flat dry',
    gender: 'women',
    isFeatured: true,
    isNewArrival: true,
    tags: ['trousers', 'formal', 'slim', 'high-rise'],
    variants: [
      { size: 'XS', color: 'Black', colorHex: '#000000', stock: 10 },
      { size: 'S', color: 'Black', colorHex: '#000000', stock: 15 },
      { size: 'M', color: 'Black', colorHex: '#000000', stock: 12 },
      { size: 'L', color: 'Black', colorHex: '#000000', stock: 8 },
      { size: 'S', color: 'Cream', colorHex: '#FFFDD0', stock: 7 },
      { size: 'M', color: 'Cream', colorHex: '#FFFDD0', stock: 9 },
    ],
    images: [{ url: PLACEHOLDER_IMAGE, altText: 'High-Rise Trousers' }],
  },
  {
    name: 'Cashmere Blend Sweater',
    description: 'Luxuriously soft cashmere blend sweater with a relaxed oversized fit. Features ribbed cuffs and hem. A timeless investment piece for cooler months.',
    shortDescription: 'Oversized cashmere-blend knit sweater',
    price: 4499,
    material: '50% Cashmere, 50% Wool',
    careInstructions: 'Hand wash cold, lay flat to dry',
    gender: 'unisex',
    isFeatured: true,
    isBestSeller: true,
    tags: ['cashmere', 'sweater', 'luxury', 'winter'],
    variants: [
      { size: 'S', color: 'Camel', colorHex: '#C19A6B', stock: 8 },
      { size: 'M', color: 'Camel', colorHex: '#C19A6B', stock: 10 },
      { size: 'L', color: 'Camel', colorHex: '#C19A6B', stock: 7 },
      { size: 'S', color: 'Ivory', colorHex: '#FFFFF0', stock: 5 },
      { size: 'M', color: 'Ivory', colorHex: '#FFFFF0', stock: 6 },
      { size: 'M', color: 'Charcoal', colorHex: '#36454F', stock: 9 },
    ],
    images: [{ url: PLACEHOLDER_IMAGE, altText: 'Cashmere Sweater' }],
  },
  {
    name: 'Silk Evening Blouse',
    description: 'Exquisite silk blouse with a feminine V-neckline and flutter sleeves. Crafted from 100% mulberry silk for an unrivalled drape and sheen.',
    shortDescription: '100% silk blouse with flutter sleeves',
    price: 3999,
    discountPrice: 3199,
    material: '100% Mulberry Silk',
    careInstructions: 'Dry clean or hand wash cold',
    gender: 'women',
    isNewArrival: true,
    tags: ['silk', 'evening', 'blouse', 'luxury'],
    variants: [
      { size: 'XS', color: 'Champagne', colorHex: '#F7E7CE', stock: 5 },
      { size: 'S', color: 'Champagne', colorHex: '#F7E7CE', stock: 8 },
      { size: 'M', color: 'Champagne', colorHex: '#F7E7CE', stock: 6 },
      { size: 'S', color: 'Blush', colorHex: '#FFB6C1', stock: 7 },
      { size: 'M', color: 'Blush', colorHex: '#FFB6C1', stock: 5 },
    ],
    images: [{ url: PLACEHOLDER_IMAGE, altText: 'Silk Evening Blouse' }],
  },
  {
    name: 'Linen Summer Shorts',
    description: 'Breezy linen shorts perfect for warm days. Features an elastic waistband with drawstring, side pockets, and a relaxed fit for ultimate comfort.',
    shortDescription: 'Lightweight linen shorts with drawstring waist',
    price: 1799,
    material: '100% Linen',
    careInstructions: 'Machine wash cold, tumble dry low',
    gender: 'men',
    isNewArrival: true,
    isBestSeller: true,
    tags: ['linen', 'summer', 'shorts', 'casual'],
    variants: [
      { size: 'S', color: 'Sand', colorHex: '#C2B280', stock: 12 },
      { size: 'M', color: 'Sand', colorHex: '#C2B280', stock: 15 },
      { size: 'L', color: 'Sand', colorHex: '#C2B280', stock: 10 },
      { size: 'M', color: 'Olive', colorHex: '#708238', stock: 8 },
      { size: 'L', color: 'Olive', colorHex: '#708238', stock: 6 },
    ],
    images: [{ url: PLACEHOLDER_IMAGE_2, altText: 'Linen Shorts' }],
  },
  {
    name: 'Leather Crossbody Bag',
    description: 'Minimalist crossbody bag crafted from genuine full-grain leather. Features an adjustable strap, magnetic closure, and interior zip pocket.',
    shortDescription: 'Genuine leather minimalist crossbody bag',
    price: 6999,
    discountPrice: 5999,
    material: '100% Full-Grain Leather',
    careInstructions: 'Wipe with damp cloth, condition regularly',
    gender: 'unisex',
    isFeatured: true,
    isBestSeller: true,
    tags: ['leather', 'bag', 'accessory', 'minimalist'],
    variants: [
      { size: 'One Size', color: 'Tan', colorHex: '#D2691E', stock: 10 },
      { size: 'One Size', color: 'Black', colorHex: '#000000', stock: 8 },
      { size: 'One Size', color: 'White', colorHex: '#FFFFFF', stock: 5 },
    ],
    images: [{ url: PLACEHOLDER_IMAGE, altText: 'Leather Crossbody Bag' }],
  },
];

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
  ]);
  console.log('🗑️ Cleared existing data');

  // Create admin user
  const admin = await User.create({
    name: 'LUXE Admin',
    email: 'admin@luxe.com',
    password: 'Admin@1234',
    role: 'admin',
    isVerified: true,
  });
  await Cart.create({ user: admin._id, items: [] });

  // Create sample user
  const user = await User.create({
    name: 'Sample Customer',
    email: 'customer@luxe.com',
    password: 'User@1234',
    role: 'user',
    isVerified: true,
    phone: '+91 9876543210',
    addresses: [{
      fullName: 'Sample Customer',
      phone: '+91 9876543210',
      addressLine1: '123 Fashion Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      isDefault: true,
    }],
  });
  await Cart.create({ user: user._id, items: [] });

  console.log('👤 Created users:');
  console.log('   Admin: admin@luxe.com / Admin@1234');
  console.log('   User:  customer@luxe.com / User@1234');

  // Create categories
  const createdCategories = await Category.insertMany(
    categories.map((cat) => ({ ...cat, isActive: true }))
  );

  const categoryMap = {};
  createdCategories.forEach((cat) => { categoryMap[cat.name] = cat._id; });
  console.log(`📁 Created ${createdCategories.length} categories`);

  // Assign categories to products
  const menShirtsId = createdCategories.find((c) => c.slug === 'mens-shirts')?._id || createdCategories[0]._id;
  const womenDressesId = createdCategories.find((c) => c.slug === 'womens-dresses')?._id || createdCategories[2]._id;
  const menTrousersId = createdCategories.find((c) => c.slug === 'mens-trousers')?._id || createdCategories[4]._id;
  const womenTopsId = createdCategories.find((c) => c.slug === 'womens-tops')?._id || createdCategories[0]._id;
  const outerwearId = createdCategories.find((c) => c.slug === 'outerwear')?._id || createdCategories[5]._id;
  const womenBottomsId = createdCategories.find((c) => c.slug === 'womens-bottoms')?._id || createdCategories[1]._id;
  const accessoriesId = createdCategories.find((c) => c.slug === 'accessories')?._id || createdCategories[6]._id;

  const categoryAssignments = [menShirtsId, womenDressesId, outerwearId, womenBottomsId, outerwearId, womenTopsId, menTrousersId, accessoriesId];

  const products = sampleProducts.map((p, i) => ({
    ...p,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + (i + 1),
    category: categoryAssignments[i] || menShirtsId,
    brand: 'LUXE',
    isActive: true,
  }));

  products.forEach((p) => {
    p.totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
    if (p.discountPrice) {
      p.discountPercent = Math.round(((p.price - p.discountPrice) / p.price) * 100);
    }
  });

  await Product.insertMany(products);
  console.log(`👗 Created ${products.length} sample products`);

  console.log('\n✅ Database seeded successfully!');
  console.log('🌐 You can now run: npm run dev (in backend folder)');
  await mongoose.disconnect();
};

seed().catch((err) => {
  if (err.errors) {
    Object.keys(err.errors).forEach((key) => {
      console.error(`Validation Error: ${key} - ${err.errors[key].message}`);
    });
  } else {
    console.error('❌ Seed failed:', err);
  }
  process.exit(1);
});
