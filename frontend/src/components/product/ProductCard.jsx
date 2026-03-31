import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiEye } from 'react-icons/fi';
import { useState } from 'react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const formatPrice = (price) => `₹${price?.toLocaleString()}`;

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [isWishListed, setIsWishListed] = useState(
    () => false /* would check user wishlist */
  );
  const { addToCart, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const effectivePrice = product.discountPrice || product.price;

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to cart');
      return;
    }
    const variant = product.variants?.[0];
    if (!variant) {
      toast.error('Please select size and color on product page');
      return;
    }
    await addToCart(product._id, 1, variant.size, variant.color);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to save items');
      return;
    }
    try {
      const res = await api.post(`/users/wishlist/${product._id}`);
      setIsWishListed(res.data.inWishlist);
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleEyeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="product-card"
      style={{ display: 'block', textDecoration: 'none', cursor: 'pointer' }}
    >
      {/* Image */}
      <div className="product-card-image">
        {product.images?.[0] ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].altText || product.name}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #f7f5f0, #e8e6e1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gray-300)',
              fontSize: '3rem',
            }}
          >
            👗
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 1 }}>
          {product.isNewArrival && <span className="product-card-badge badge-new">New</span>}
          {product.discountPercent > 0 && (
            <span className="product-card-badge badge-sale">-{product.discountPercent}%</span>
          )}
          {product.isBestSeller && <span className="product-card-badge badge-bestseller">Best</span>}
        </div>

        {/* Action Buttons */}
        <div className="product-card-actions">
          <button
            className={`product-card-action-btn ${isWishListed ? 'active' : ''}`}
            onClick={handleWishlist}
            title="Add to wishlist"
          >
            <FiHeart size={16} fill={isWishListed ? 'currentColor' : 'none'} />
          </button>
          <button
            className="product-card-action-btn"
            onClick={handleQuickAdd}
            disabled={isLoading}
            title="Quick add to cart"
          >
            <FiShoppingBag size={16} />
          </button>
          <button
            className="product-card-action-btn"
            onClick={handleEyeClick}
            title="View product"
          >
            <FiEye size={16} />
          </button>
        </div>

        {/* Out of stock overlay */}
        {product.totalStock === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(2px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <span
              style={{
                background: 'var(--color-dark)',
                color: 'var(--color-white)',
                padding: '8px 20px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="product-card-body">
        <p className="product-card-category">{product.category?.name || product.brand}</p>
        <h3 className="product-card-name">{product.name}</h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{ color: star <= Math.round(product.rating) ? '#c9a96e' : '#e8e6e1' }}
                >
                  ★
                </span>
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>
              ({product.numReviews})
            </span>
          </div>
        )}

        <div className="product-card-price">
          <span className="price-current">{formatPrice(effectivePrice)}</span>
          {product.discountPrice && (
            <>
              <span className="price-original">{formatPrice(product.price)}</span>
              <span className="price-discount">-{product.discountPercent}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
