import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { getItemCount, openCart } = useCartStore();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'New Arrivals', to: '/products?filter=new' },
    { label: 'Women', to: '/products?gender=women' },
    { label: 'Men', to: '/products?gender=men' },
    { label: 'Collections', to: '/collections' },
    { label: 'Sale', to: '/products?category=sale' },
  ];

  const isTransparent = isHome && !scrolled;

  return (
    <>
      <nav className={`navbar ${isTransparent ? 'navbar-transparent' : 'navbar-scrolled'}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">LUXE</Link>

          {/* Desktop Nav */}
          <ul className="navbar-nav" style={{ listStyle: 'none' }}>
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar-actions">
            <Link to="/search" className="nav-icon-btn" aria-label="Search">
              <FiSearch />
            </Link>
            <Link
              to={isAuthenticated ? '/account/wishlist' : '/login'}
              className="nav-icon-btn"
              aria-label="Wishlist"
            >
              <FiHeart />
            </Link>
            <button
              className="nav-icon-btn"
              onClick={openCart}
              aria-label="Cart"
              style={{ position: 'relative' }}
            >
              <FiShoppingBag />
              {getItemCount() > 0 && (
                <span className="nav-badge">{getItemCount()}</span>
              )}
            </button>
            <Link
              to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/account') : '/login'}
              className="nav-icon-btn"
              aria-label="Account"
            >
              {isAuthenticated && user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <FiUser />
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="nav-icon-btn"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Menu"
              style={{ display: 'none' }}
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--color-white)',
            zIndex: 'var(--z-modal)',
            padding: '80px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                fontWeight: 400,
                color: 'var(--color-dark)',
                padding: '12px 0',
                borderBottom: '1px solid var(--color-gray-100)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn btn-outline" style={{ flex: 1 }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>Sign Up</Link>
          </div>
        </div>
      )}

      {/* Spacer for non-home pages */}
      {!isHome && <div style={{ height: '72px' }} />}
    </>
  );
};

export default Navbar;
