const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    title: String,
    isVerifiedPurchase: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: String,
  stock: { type: Number, required: true, default: 0 },
  sku: String,
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: String,
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    discountPercent: Number,
    images: [
      {
        url: { type: String, required: true },
        public_id: String,
        altText: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: { type: String, default: 'LUXE' },
    tags: [String],
    variants: [variantSchema],
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    totalStock: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    material: String,
    careInstructions: String,
    gender: { type: String, enum: ['men', 'women', 'unisex', 'kids'], default: 'unisex' },
    sizes: [String],
    colors: [String],
    metaTitle: String,
    metaDescription: String,
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Calculate average rating before save
productSchema.pre('save', function (next) {
  if (this.reviews.length > 0) {
    this.rating =
      this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  this.totalStock = this.variants.reduce((sum, v) => sum + v.stock, 0);
  if (this.discountPrice) {
    this.discountPercent = Math.round(
      ((this.price - this.discountPrice) / this.price) * 100
    );
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
