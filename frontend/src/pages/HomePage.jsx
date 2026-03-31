import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';

const categories = [
  { name: "Women's Collection", gender: 'women', emoji: '✨' },
  { name: "Men's Collection", gender: 'men', emoji: '🎯' },
  { name: 'New Arrivals', filter: 'new', emoji: '🌟' },
  { name: 'Sale', category: 'sale', emoji: '🔥' },
];

const features = [
  { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free returns' },
  { icon: '🔒', title: 'Secure Payment', desc: '100% secure transactions' },
  { icon: '💎', title: 'Premium Quality', desc: 'Finest materials & craftsmanship' },
];

const HomePage = () => {
  const heroRef = useRef(null);

  const { data: featuredData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products?isFeatured=true&limit=8').then((r) => r.data),
  });

  const { data: newArrivalsData } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => api.get('/products?isNewArrival=true&limit=4').then((r) => r.data),
  });

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg" ref={heroRef} />
        <div className="hero-pattern" />

        {/* Floating Spheres */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(201,169,110,0.12), transparent 70%)',
            top: '-100px',
            right: '-100px',
            animation: 'float 8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.04), transparent 70%)',
            bottom: '-50px',
            left: '-50px',
            animation: 'float 10s ease-in-out infinite reverse',
            pointerEvents: 'none',
          }}
        />

        <div className="hero-content">
          <span className="hero-eyebrow">New Season · Spring 2024</span>
          <h1 className="hero-title">
            Wear Your <em>Story</em>
            <br />
            In Style
          </h1>
          <p className="hero-subtitle">
            Discover our curated collections of premium clothing, crafted for those
            who appreciate timeless elegance and modern sophistication.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-lg hero-btn-primary">
              Shop Now
            </Link>
            <Link to="/collections" className="btn btn-lg hero-btn-outline">
              View Collections
            </Link>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <div className="hero-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ===== FEATURES BAR ===== */}
      <section style={{ background: 'var(--color-cream)', padding: '24px 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0',
            }}
          >
            {features.map((f, i) => (
              <div
                key={f.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 24px',
                  borderRight: i < features.length - 1 ? '1px solid var(--color-gray-200)' : 'none',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-dark)', marginBottom: '2px' }}>
                    {f.title}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section" style={{ background: 'var(--color-white)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Shop by Style</span>
            <h2 className="section-title">Explore Collections</h2>
            <p className="section-subtitle">Find your perfect look across our curated categories</p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            {categories.map((cat) => {
              const href = cat.gender
                ? `/products?gender=${cat.gender}`
                : cat.filter
                ? `/products?filter=${cat.filter}`
                : `/products?category=${cat.category}`;
              return (
                <Link
                  key={cat.name}
                  to={href}
                  style={{
                    display: 'block',
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    aspectRatio: '3/4',
                    background: 'linear-gradient(135deg, var(--color-dark), #3d3a36)',
                    textDecoration: 'none',
                    transition: 'transform 0.4s, box-shadow 0.4s',
                    boxShadow: 'var(--shadow-md)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-2xl)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'radial-gradient(circle at 50% 50%, rgba(201,169,110,0.15), transparent 70%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '3rem' }}>{cat.emoji}</span>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.5rem',
                        fontWeight: 400,
                        color: 'var(--color-white)',
                        textAlign: 'center',
                        padding: '0 20px',
                      }}
                    >
                      {cat.name}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--color-gold)',
                        fontSize: '0.8rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Shop Now <FiArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="section" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="section-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span className="section-eyebrow">Handpicked For You</span>
            <h2 className="section-title">Featured Products</h2>
          </div>
          {featuredData?.products?.length > 0 ? (
            <div className="products-grid">
              {featuredData.products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: '16px', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '20px', width: '40%' }} />
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/products" className="btn btn-outline btn-lg">
              View All Products <FiArrowRight style={{ marginLeft: '6px' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE BANNER ===== */}
      <section
        style={{
          background: 'var(--color-dark)',
          padding: '20px 0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '60px',
            animation: 'slide-marquee 20s linear infinite',
            whiteSpace: 'nowrap',
          }}
        >
          {Array(4).fill(['FREE SHIPPING ON ₹999+', '•', 'NEW ARRIVALS WEEKLY', '•', 'PREMIUM QUALITY', '•', 'HASSLE-FREE RETURNS', '•']).flat().map((text, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                fontWeight: 500,
                color: text === '•' ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)',
              }}
            >
              {text}
            </span>
          ))}
        </div>
        <style>{`
          @keyframes slide-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      {newArrivalsData?.products?.length > 0 && (
        <section className="section" style={{ background: 'var(--color-white)' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center' }}>
              <span className="section-eyebrow">Just Landed</span>
              <h2 className="section-title">New Arrivals</h2>
              <p className="section-subtitle">The latest additions to our collection, fresh off the runway</p>
            </div>
            <div className="products-grid">
              {newArrivalsData.products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA SECTION ===== */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1a1814 0%, #2d2924 50%, #1a1814 100%)',
          padding: '80px 0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(201,169,110,0.08), transparent 50%), radial-gradient(circle at 80% 50%, rgba(201,169,110,0.06), transparent 50%)',
          }}
        />
        <div className="container" style={{ position: 'relative' }}>
          <span className="section-eyebrow" style={{ color: 'var(--color-gold)' }}>Exclusive Membership</span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--color-white)',
              fontWeight: 400,
              marginBottom: '16px',
            }}
          >
            Join the LUXE Family
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '40px', fontSize: '1.0625rem' }}>
            Get early access to new collections, exclusive deals, and style tips.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-gold btn-lg">
              Create Account
            </Link>
            <Link
              to="/login"
              className="btn btn-lg"
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
