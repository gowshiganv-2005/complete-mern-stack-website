import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiHeart, FiShoppingBag, FiShare2, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import api from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', title: '' });
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related-products', data?.product?.category?._id],
    queryFn: () =>
      api.get(`/products?category=${data.product.category.slug}&limit=4`).then((r) => r.data),
    enabled: !!data?.product?.category?.slug,
  });

  const product = data?.product;

  const availableSizes = [...new Set(product?.variants?.map((v) => v.size) || [])];
  const availableColors = product?.variants
    ?.filter((v) => !selectedSize || v.size === selectedSize)
    ?.map((v) => ({ color: v.color, hex: v.colorHex, stock: v.stock }));

  const selectedVariant = product?.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedColor) { toast.error('Please select a color'); return; }
    await addToCart(product._id, quantity, selectedSize, selectedColor);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    try {
      const res = await api.post(`/users/wishlist/${product._id}`);
      setIsWishlisted(res.data.inWishlist);
      toast.success(res.data.message);
    } catch { toast.error('Failed'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Login to review'); return; }
    try {
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '', title: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
          <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: '16px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[60, 300, 150, 200].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: '20px', width: `${w}px`, maxWidth: '100%' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2>Product not found</h2>
      </div>
    );
  }

  const effectivePrice = product.discountPrice || product.price;

  return (
    <div>
      <div className="container" style={{ padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
          {/* ===== IMAGE GALLERY ===== */}
          <div>
            {/* Main Image */}
            <div
              style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                aspectRatio: '3/4',
                background: 'var(--color-cream)',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              {product.images[currentImageIndex] && (
                <img
                  src={product.images[currentImageIndex].url}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i - 1 + product.images.length) % product.images.length)}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i + 1) % product.images.length)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}
              {product.discountPercent > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'var(--color-error)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  -{product.discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    style={{
                      width: '72px',
                      height: '88px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: `2px solid ${currentImageIndex === i ? 'var(--color-dark)' : 'transparent'}`,
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <img src={img.url} alt={`View ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== PRODUCT INFO ===== */}
          <div>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '8px' }}>
              {product.category?.name} · {product.brand}
            </p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, marginBottom: '16px', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div className="stars">
                  {[1,2,3,4,5].map((s) => (
                    <FiStar key={s} size={16} fill={s <= Math.round(product.rating) ? '#c9a96e' : 'none'} color="#c9a96e" />
                  ))}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-400)' }}>
                  {product.rating.toFixed(1)} ({product.numReviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                  ₹{effectivePrice.toLocaleString()}
                </span>
                {product.discountPrice && (
                  <span style={{ fontSize: '1.1rem', color: 'var(--color-gray-400)', textDecoration: 'line-through' }}>
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)', marginTop: '4px' }}>
                Inclusive of all taxes · Free shipping on ₹999+
              </p>
            </div>

            {/* Size Selection */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Size: <span style={{ color: 'var(--color-gray-500)', fontWeight: 400 }}>{selectedSize}</span>
                </p>
                <button style={{ fontSize: '0.8rem', color: 'var(--color-gold)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Size Guide
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSelectedColor(''); }}
                    style={{
                      padding: '10px 18px',
                      border: `1.5px solid ${selectedSize === size ? 'var(--color-dark)' : 'var(--color-gray-200)'}`,
                      borderRadius: '4px',
                      background: selectedSize === size ? 'var(--color-dark)' : 'transparent',
                      color: selectedSize === size ? 'var(--color-white)' : 'var(--color-dark)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            {selectedSize && availableColors?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Color: <span style={{ color: 'var(--color-gray-500)', fontWeight: 400 }}>{selectedColor}</span>
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {availableColors.map(({ color, hex, stock }) => (
                    <button
                      key={color}
                      onClick={() => stock > 0 && setSelectedColor(color)}
                      disabled={stock === 0}
                      title={`${color}${stock === 0 ? ' (Out of stock)' : ''}`}
                      style={{
                        padding: '8px 16px',
                        border: `1.5px solid ${selectedColor === color ? 'var(--color-dark)' : 'var(--color-gray-200)'}`,
                        borderRadius: '4px',
                        background: selectedColor === color ? 'var(--color-dark)' : 'transparent',
                        color: selectedColor === color ? 'var(--color-white)' : 'var(--color-dark)',
                        fontSize: '0.875rem',
                        cursor: stock === 0 ? 'not-allowed' : 'pointer',
                        opacity: stock === 0 ? 0.4 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {hex && (
                        <span style={{ width: 14, height: 14, borderRadius: '50%', background: hex, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                      )}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Quantity
              </p>
              <div className="qty-control" style={{ width: 'fit-content' }}>
                <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              {selectedVariant && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)', marginTop: '8px' }}>
                  {selectedVariant.stock} items in stock
                </p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={isLoading}
                style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
              >
                <FiShoppingBag />
                {isLoading ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                className="btn btn-outline btn-icon"
                onClick={handleWishlist}
                style={{ padding: '14px' }}
                title="Add to wishlist"
              >
                <FiHeart fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <button
                className="btn btn-ghost btn-icon"
                style={{ padding: '14px' }}
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                title="Share"
              >
                <FiShare2 />
              </button>
            </div>

            {/* Product Meta */}
            <div style={{ padding: '20px', background: 'var(--color-off-white)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {product.material && (
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-gray-400)', minWidth: '100px' }}>Material</span>
                  <span>{product.material}</span>
                </div>
              )}
              {product.careInstructions && (
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-gray-400)', minWidth: '100px' }}>Care</span>
                  <span>{product.careInstructions}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-gray-400)', minWidth: '100px' }}>Gender</span>
                <span style={{ textTransform: 'capitalize' }}>{product.gender}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div style={{ marginTop: '60px' }}>
          <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--color-gray-100)' }}>
            {['description', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '14px 28px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? 'var(--color-dark)' : 'transparent'}`,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8125rem',
                  fontWeight: activeTab === tab ? 600 : 400,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: activeTab === tab ? 'var(--color-dark)' : 'var(--color-gray-400)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '-1px',
                }}
              >
                {tab} {tab === 'reviews' && `(${product.numReviews})`}
              </button>
            ))}
          </div>

          <div style={{ padding: '32px 0' }}>
            {activeTab === 'description' ? (
              <div style={{ maxWidth: '700px' }}>
                <p style={{ lineHeight: 1.8, color: 'var(--color-gray-600)', fontSize: '1rem', whiteSpace: 'pre-line' }}>
                  {product.description}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                {/* Reviews List */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '24px' }}>
                    Customer Reviews
                  </h3>
                  {product.reviews?.length === 0 ? (
                    <p style={{ color: 'var(--color-gray-400)' }}>No reviews yet. Be the first to review!</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {product.reviews.slice(0, 5).map((review) => (
                        <div key={review._id} style={{ padding: '20px', background: 'var(--color-off-white)', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>
                              {review.user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.user?.name}</p>
                              <div className="stars" style={{ fontSize: '0.75rem' }}>
                                {[1,2,3,4,5].map((s) => <span key={s} style={{ color: s <= review.rating ? '#c9a96e' : '#e8e6e1' }}>★</span>)}
                              </div>
                            </div>
                          </div>
                          {review.title && <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.9rem' }}>{review.title}</p>}
                          <p style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Write Review */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '24px' }}>
                    Write a Review
                  </h3>
                  <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1,2,3,4,5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: s <= reviewForm.rating ? '#c9a96e' : '#e8e6e1' }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input
                        className="form-input"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Summarize your experience"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Review</label>
                      <textarea
                        className="form-input"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        placeholder="Share your thoughts..."
                        rows={4}
                        required
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">Submit Review</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== RELATED PRODUCTS ===== */}
        {relatedData?.products?.filter((p) => p._id !== product._id)?.length > 0 && (
          <div style={{ marginTop: '60px' }}>
            <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span className="section-eyebrow">You May Also Like</span>
              <h2 className="section-title">Related Products</h2>
            </div>
            <div className="products-grid">
              {relatedData.products.filter((p) => p._id !== product._id).slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
