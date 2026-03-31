import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiUser, FiMapPin, FiLock, FiLogOut, FiChevronRight } from 'react-icons/fi';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const OrderStatusBadge = ({ status }) => (
  <span className={`order-status status-${status}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
  const [addingAddress, setAddingAddress] = useState(false);

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my?limit=20').then((r) => r.data),
    enabled: activeTab === 'orders',
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/profile').then((r) => r.data),
    enabled: activeTab === 'profile' || activeTab === 'addresses',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/addresses', newAddress);
      queryClient.invalidateQueries(['profile']);
      setAddingAddress(false);
      setNewAddress({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
      toast.success('Address added');
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      queryClient.invalidateQueries(['profile']);
      toast.success('Address deleted');
    } catch {
      toast.error('Failed');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: <FiShoppingBag /> },
    { id: 'wishlist', label: 'Wishlist', icon: <FiHeart /> },
    { id: 'addresses', label: 'Addresses', icon: <FiMapPin /> },
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'security', label: 'Security', icon: <FiLock /> },
  ];

  return (
    <div className="container" style={{ padding: '48px 24px', minHeight: '100vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px' }}>
        {/* Sidebar */}
        <div>
          {/* User Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1814, #2d2924)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
              color: 'white',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: user?.avatar ? `url(${user.avatar}) center/cover` : 'rgba(201,169,110,0.3)',
                border: '2px solid var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '12px',
              }}
            >
              {!user?.avatar && user?.name?.[0]?.toUpperCase()}
            </div>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '2px' }}>{user?.name}</p>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>{user?.email}</p>
          </div>

          {/* Navigation */}
          <div style={{ background: 'var(--color-white)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-gray-100)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '14px 20px',
                  background: activeTab === tab.id ? 'var(--color-off-white)' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${activeTab === tab.id ? 'var(--color-dark)' : 'transparent'}`,
                  borderBottom: '1px solid var(--color-gray-100)',
                  color: activeTab === tab.id ? 'var(--color-dark)' : 'var(--color-gray-500)',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
              >
                {tab.icon}
                {tab.label}
                <FiChevronRight size={14} style={{ marginLeft: 'auto' }} />
              </button>
            ))}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '14px 20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-error)',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <FiLogOut />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="admin-page-title">My Orders</h2>
              {ordersLoading ? (
                <p>Loading orders...</p>
              ) : ordersData?.orders?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'var(--color-white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '8px' }}>No orders yet</h3>
                  <p style={{ color: 'var(--color-gray-400)', marginBottom: '20px' }}>Start shopping to see your orders here</p>
                  <button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Now</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {ordersData.orders.map((order) => (
                    <div
                      key={order._id}
                      style={{
                        background: 'var(--color-white)',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--color-gray-100)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{order.orderNumber}</p>
                          <p style={{ color: 'var(--color-gray-400)', fontSize: '0.8125rem' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
                          {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <p style={{ fontWeight: 700, fontSize: '1rem' }}>₹{order.pricing?.total?.toLocaleString()}</p>
                          <button
                            onClick={() => navigate(`/account/orders/${order._id}`)}
                            className="btn btn-outline btn-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div>
              <h2 className="admin-page-title">My Wishlist</h2>
              {profileData?.user?.wishlist?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'var(--color-white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❤️</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '8px' }}>Your wishlist is empty</h3>
                  <p style={{ color: 'var(--color-gray-400)' }}>Save items you love to your wishlist</p>
                </div>
              ) : (
                <div className="products-grid">
                  {(profileData?.user?.wishlist || []).map((product) => (
                    <div key={product._id}>{/* ProductCard component */}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 className="admin-page-title" style={{ margin: 0 }}>My Addresses</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setAddingAddress(true)}>
                  + Add Address
                </button>
              </div>

              {addingAddress && (
                <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-gray-100)' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '20px' }}>New Address</h3>
                  <form onSubmit={handleAddAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {[
                      { name: 'fullName', label: 'Full Name', colspan: true },
                      { name: 'phone', label: 'Phone Number', colspan: false },
                      { name: 'addressLine1', label: 'Address Line 1', colspan: true },
                      { name: 'addressLine2', label: 'Address Line 2 (Optional)', colspan: true },
                      { name: 'city', label: 'City' },
                      { name: 'state', label: 'State' },
                      { name: 'postalCode', label: 'Postal Code' },
                      { name: 'country', label: 'Country' },
                    ].map(({ name, label, colspan }) => (
                      <div key={name} className="form-group" style={{ gridColumn: colspan ? 'span 2' : 'span 1' }}>
                        <label className="form-label">{label}</label>
                        <input
                          className="form-input"
                          value={newAddress[name]}
                          onChange={(e) => setNewAddress(a => ({ ...a, [name]: e.target.value }))}
                          required={name !== 'addressLine2'}
                        />
                      </div>
                    ))}
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                      <button type="submit" className="btn btn-primary">Save Address</button>
                      <button type="button" className="btn btn-ghost" onClick={() => setAddingAddress(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(profileData?.user?.addresses || []).map((address) => (
                  <div key={address._id} style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)', border: `1px solid ${address.isDefault ? 'var(--color-gold)' : 'var(--color-gray-100)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        {address.isDefault && <span className="tag tag-gold" style={{ marginBottom: '8px', display: 'inline-block' }}>Default</span>}
                        <p style={{ fontWeight: 600, marginBottom: '4px' }}>{address.fullName}</p>
                        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                          {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}<br />
                          {address.city}, {address.state} {address.postalCode}<br />
                          {address.country}<br />
                          📞 {address.phone}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteAddress(address._id)} style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="admin-page-title">My Profile</h2>
              <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={profileForm.name} onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" value={profileForm.phone} onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>Save Changes</button>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="admin-page-title">Security</h2>
              <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '24px' }}>Change Password</h3>
                {user?.googleId && !user?.password ? (
                  <p style={{ color: 'var(--color-gray-400)' }}>You're signed in with Google. Password change is not available.</p>
                ) : (
                  <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                    {[
                      { name: 'currentPassword', label: 'Current Password' },
                      { name: 'newPassword', label: 'New Password' },
                      { name: 'confirmPassword', label: 'Confirm New Password' },
                    ].map(({ name, label }) => (
                      <div key={name} className="form-group">
                        <label className="form-label">{label}</label>
                        <input type="password" className="form-input" value={passwordForm[name]} onChange={(e) => setPasswordForm(f => ({ ...f, [name]: e.target.value }))} required />
                      </div>
                    ))}
                    <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>Change Password</button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
