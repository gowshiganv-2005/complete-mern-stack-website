import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiPackage, FiUsers, FiTag,
  FiLogOut, FiSettings, FiBell, FiMenu, FiX, FiChevronRight,
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';

const navItems = [
  { section: 'Overview', items: [{ label: 'Dashboard', to: '/admin', icon: <FiGrid /> }] },
  {
    section: 'Catalog',
    items: [
      { label: 'Products', to: '/admin/products', icon: <FiPackage /> },
      { label: 'Categories', to: '/admin/categories', icon: <FiTag /> },
    ],
  },
  {
    section: 'Sales',
    items: [
      { label: 'Orders', to: '/admin/orders', icon: <FiShoppingBag /> },
    ],
  },
  {
    section: 'Users',
    items: [
      { label: 'Customers', to: '/admin/users', icon: <FiUsers /> },
    ],
  },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: sidebarOpen ? '256px' : '72px', transition: 'width 0.3s' }}>
        {/* Header */}
        <div className="admin-sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {sidebarOpen && (
            <div>
              <span className="admin-logo">LUXE</span>
              <span className="admin-logo-sub">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px', display: 'flex' }}
          >
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          {navItems.map(({ section, items }) => (
            <div key={section}>
              {sidebarOpen && <p className="admin-nav-section">{section}</p>}
              {items.map(({ label, to, icon }) => {
                const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`admin-nav-link ${isActive ? 'active' : ''}`}
                    title={!sidebarOpen ? label : undefined}
                    style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', paddingLeft: sidebarOpen ? undefined : '0', paddingRight: sidebarOpen ? undefined : '0' }}
                  >
                    <span className="nav-icon">{icon}</span>
                    {sidebarOpen && <span>{label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            className="admin-nav-link"
            style={{ color: 'rgba(255,255,255,0.4)', borderLeft: 'none', justifyContent: sidebarOpen ? 'flex-start' : 'center', width: '100%' }}
          >
            <FiLogOut className="nav-icon" size={18} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main" style={{ marginLeft: sidebarOpen ? '256px' : '72px', transition: 'margin 0.3s' }}>
        {/* Header */}
        <header className="admin-header">
          <div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-gray-400)' }}>
              <Link to="/admin" style={{ color: 'inherit' }}>Admin</Link>
              {location.pathname !== '/admin' && (
                <>
                  <FiChevronRight size={12} />
                  <span style={{ color: 'var(--color-dark)', fontWeight: 500 }}>
                    {location.pathname.split('/').pop()?.charAt(0).toUpperCase() + location.pathname.split('/').pop()?.slice(1)}
                  </span>
                </>
              )}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--color-gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer', position: 'relative' }}>
              <FiBell size={17} />
              <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: 'var(--color-error)', borderRadius: '50%' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--color-off-white)', borderRadius: '8px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: user?.avatar ? `url(${user.avatar}) center/cover` : 'var(--color-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: 600 }}>
                {!user?.avatar && user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-dark)' }}>{user?.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 500, letterSpacing: '0.06em' }}>Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
