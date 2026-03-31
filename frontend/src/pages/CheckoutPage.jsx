import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { FiCheck, FiShoppingBag } from 'react-icons/fi';
import api from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const steps = ['Cart Review', 'Shipping', 'Payment', 'Confirm'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getSubtotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isPlacing, setIsPlacing] = useState(false);
  const [customAddress, setCustomAddress] = useState({ fullName: '', phone: '', addressLine1: '', city: '', state: '', postalCode: '', country: 'India' });
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ['profile-checkout'],
    queryFn: () => api.get('/users/profile').then((r) => r.data),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛍️</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '12px' }}>Your cart is empty</h2>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>Start Shopping</button>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shippingCost = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCost + tax;

  const handlePlaceOrder = async () => {
    const shippingAddress = useCustomAddress || !selectedAddress
      ? customAddress
      : profileData?.user?.addresses?.find((a) => a._id === selectedAddress);

    if (!shippingAddress?.city) {
      toast.error('Please select or enter a shipping address');
      return;
    }

    setIsPlacing(true);
    try {
      const res = await api.post('/orders', {
        shippingAddress,
        paymentMethod,
      });
      clearCart();
      navigate(`/account/orders/${res.data.order._id}?success=true`);
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1100px' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, marginBottom: '8px' }}>Checkout</h1>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '0' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? '1' : 'none' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: i <= step ? 'var(--color-dark)' : 'var(--color-gray-200)',
                color: i <= step ? 'white' : 'var(--color-gray-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 600,
                flexShrink: 0,
                transition: 'background 0.3s',
              }}
            >
              {i < step ? <FiCheck size={14} /> : <span>{i + 1}</span>}
            </div>
            <span style={{ fontSize: '0.8125rem', marginLeft: '8px', color: i === step ? 'var(--color-dark)' : 'var(--color-gray-400)', fontWeight: i === step ? 600 : 400 }}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: '1px', background: i < step ? 'var(--color-dark)' : 'var(--color-gray-200)', margin: '0 12px', transition: 'background 0.3s' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'flex-start' }}>
        {/* Left - Steps */}
        <div>
          {/* Step 0: Cart Review */}
          {step === 0 && (
            <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '20px' }}>Review Items</h2>
              {cart.items.map((item) => (
                <div key={item._id} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                  <div style={{ width: 72, height: 88, borderRadius: '8px', overflow: 'hidden', background: 'var(--color-cream)', flexShrink: 0 }}>
                    {item.product?.images?.[0] && <img src={item.product.images[0].url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.9375rem' }}>{item.product?.name}</p>
                    <p style={{ color: 'var(--color-gray-400)', fontSize: '0.8125rem', marginBottom: '8px' }}>
                      {item.size} · {item.color} · Qty: {item.quantity}
                    </p>
                    <p style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              <button className="btn btn-primary" onClick={() => setStep(1)} style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>
                Continue to Shipping
              </button>
            </div>
          )}

          {/* Step 1: Shipping */}
          {step === 1 && (
            <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '20px' }}>Shipping Address</h2>

              {/* Saved Addresses */}
              {profileData?.user?.addresses?.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Saved Addresses</p>
                  {profileData.user.addresses.map((addr) => (
                    <label key={addr._id} style={{ display: 'flex', gap: '12px', padding: '16px', border: `1.5px solid ${selectedAddress === addr._id ? 'var(--color-dark)' : 'var(--color-gray-200)'}`, borderRadius: '10px', marginBottom: '8px', cursor: 'pointer', transition: 'border 0.2s' }}>
                      <input type="radio" name="address" value={addr._id} checked={selectedAddress === addr._id && !useCustomAddress} onChange={() => { setSelectedAddress(addr._id); setUseCustomAddress(false); }} style={{ marginTop: '4px', accentColor: 'var(--color-dark)' }} />
                      <div>
                        {addr.isDefault && <span className="tag tag-gold" style={{ marginBottom: '6px', display: 'inline-block' }}>Default</span>}
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{addr.fullName}</p>
                        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                          {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                      </div>
                    </label>
                  ))}
                  <button onClick={() => setUseCustomAddress(!useCustomAddress)} style={{ fontSize: '0.875rem', color: 'var(--color-dark)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
                    + Use a different address
                  </button>
                </div>
              )}

              {/* Custom Address Form */}
              {(useCustomAddress || !profileData?.user?.addresses?.length) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  {[
                    { name: 'fullName', label: 'Full Name', span: true },
                    { name: 'phone', label: 'Phone', span: false },
                    { name: 'addressLine1', label: 'Address', span: true },
                    { name: 'city', label: 'City', span: false },
                    { name: 'state', label: 'State', span: false },
                    { name: 'postalCode', label: 'Postal Code', span: false },
                  ].map(({ name, label, span }) => (
                    <div key={name} className="form-group" style={{ gridColumn: span ? 'span 2' : 'auto' }}>
                      <label className="form-label">{label}</label>
                      <input className="form-input" value={customAddress[name]} onChange={(e) => setCustomAddress(a => ({ ...a, [name]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost" onClick={() => setStep(0)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center' }}>Continue to Payment</button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '20px' }}>Payment Method</h2>
              {[
                { value: 'cod', label: 'Cash on Delivery', icon: '💰', desc: 'Pay when you receive your order' },
                { value: 'stripe', label: 'Credit / Debit Card', icon: '💳', desc: 'Secured by Stripe' },
                { value: 'upi', label: 'UPI', icon: '📱', desc: 'Pay via GPay, PhonePe, Paytm' },
              ].map(({ value, label, icon, desc }) => (
                <label
                  key={value}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '16px',
                    border: `1.5px solid ${paymentMethod === value ? 'var(--color-dark)' : 'var(--color-gray-200)'}`,
                    borderRadius: '10px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    transition: 'border 0.2s',
                  }}
                >
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} style={{ accentColor: 'var(--color-dark)' }} />
                  <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{label}</p>
                    <p style={{ color: 'var(--color-gray-400)', fontSize: '0.8125rem' }}>{desc}</p>
                  </div>
                </label>
              ))}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)} style={{ flex: 1, justifyContent: 'center' }}>Review Order</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '20px' }}>Confirm Order</h2>
              <div style={{ background: 'var(--color-off-white)', borderRadius: '10px', padding: '16px', marginBottom: '20px', fontSize: '0.875rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>Payment Method</p>
                <p style={{ color: 'var(--color-gray-500)', textTransform: 'capitalize' }}>{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                <button
                  className="btn btn-primary"
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                  style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                >
                  <FiShoppingBag />
                  {isPlacing ? 'Placing Order...' : `Place Order · ₹${total.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right - Order Summary */}
        <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '20px' }}>Order Summary</h3>
          {cart.items.map((item) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-gray-600)' }}>
                {item.product?.name?.substring(0, 25)}{item.product?.name?.length > 25 ? '...' : ''} × {item.quantity}
              </span>
              <span style={{ fontWeight: 500 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--color-gray-100)', marginTop: '16px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Subtotal', value: `₹${subtotal.toLocaleString()}` },
              { label: 'Shipping', value: shippingCost === 0 ? 'FREE' : `₹${shippingCost}`, green: shippingCost === 0 },
              { label: 'Tax (5%)', value: `₹${tax}` },
            ].map(({ label, value, green }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>{label}</span>
                <span style={{ color: green ? 'var(--color-success)' : 'inherit' }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.125rem', paddingTop: '12px', borderTop: '2px solid var(--color-dark)' }}>
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
