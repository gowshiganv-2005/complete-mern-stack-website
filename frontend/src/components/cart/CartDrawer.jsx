import { useEffect } from 'react';
import { FiX, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';

const CartDrawer = () => {
  const { cart, isOpen, closeCart, updateItem, removeItem, getSubtotal } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const shippingCost = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCost + tax;

  return (
    <>
      <div className="drawer-overlay" onClick={closeCart} />
      <div className="drawer">
        {/* Header */}
        <div className="drawer-header">
          <h2 className="drawer-title">
            Your Cart
            {cart?.items?.length > 0 && (
              <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-gray-400)', marginLeft: '8px' }}>
                ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <button className="btn-icon btn-ghost" onClick={closeCart} aria-label="Close cart">
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {!cart || cart.items.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{ fontSize: '4rem' }}>🛍️</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400 }}>
                Your cart is empty
              </h3>
              <p style={{ color: 'var(--color-gray-400)', fontSize: '0.9rem' }}>
                Discover our latest collections and add your favorites.
              </p>
              <button className="btn btn-primary" onClick={closeCart} style={{ marginTop: '8px' }}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div>
              {cart.items.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="cart-item-image">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0].url} alt={item.product.name} />
                    ) : (
                      <div className="skeleton" style={{ width: '100%', height: '100%' }} />
                    )}
                  </div>
                  <div>
                    <Link
                      to={`/products/${item.product?.slug}`}
                      onClick={closeCart}
                      className="cart-item-name"
                      style={{ display: 'block' }}
                    >
                      {item.product?.name}
                    </Link>
                    <p className="cart-item-variant">
                      {item.size} · {item.color}
                    </p>
                    <div className="cart-item-controls">
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          onClick={() => updateItem(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateItem(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeItem(item._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-gray-400)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-gray-400)')}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart?.items?.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Shipping</span>
                <span style={{ color: shippingCost === 0 ? 'var(--color-success)' : 'inherit' }}>
                  {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Tax (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: '1.0625rem',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--color-gray-200)',
                }}
              >
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              {subtotal < 999 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-gold)', textAlign: 'center' }}>
                  Add ₹{(999 - subtotal).toLocaleString()} more for free shipping!
                </p>
              )}
            </div>
            <Link
              to="/checkout"
              className="btn btn-primary w-full"
              onClick={closeCart}
              style={{ justifyContent: 'center', gap: '8px' }}
            >
              Proceed to Checkout <FiArrowRight />
            </Link>
            <button
              onClick={closeCart}
              style={{
                width: '100%',
                marginTop: '12px',
                color: 'var(--color-gray-500)',
                fontSize: '0.8125rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
