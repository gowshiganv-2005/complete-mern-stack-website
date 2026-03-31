import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiSend } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'var(--color-dark)',
        color: 'rgba(255,255,255,0.65)',
        paddingTop: '80px',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '48px',
            paddingBottom: '64px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                letterSpacing: '0.15em',
                color: 'var(--color-white)',
                marginBottom: '16px',
              }}
            >
              LUXE
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.8, marginBottom: '24px', color: 'rgba(255,255,255,0.5)' }}>
              Timeless fashion for those who appreciate detail and craftsmanship.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[
                { icon: <FiInstagram />, href: '#', label: 'Instagram' },
                { icon: <FiTwitter />, href: '#', label: 'Twitter' },
                { icon: <FiFacebook />, href: '#', label: 'Facebook' },
              ].map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '1rem',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-gold)';
                    e.currentTarget.style.color = 'var(--color-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: 'Shop',
              links: [
                { label: 'New Arrivals', to: '/products?filter=new' },
                { label: 'Women', to: '/products?gender=women' },
                { label: 'Men', to: '/products?gender=men' },
                { label: 'Sale', to: '/products?category=sale' },
                { label: 'Collections', to: '/collections' },
              ],
            },
            {
              title: 'Help',
              links: [
                { label: 'Size Guide', to: '/size-guide' },
                { label: 'Shipping Info', to: '/shipping' },
                { label: 'Returns', to: '/returns' },
                { label: 'FAQ', to: '/faq' },
                { label: 'Contact Us', to: '/contact' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About Us', to: '/about' },
                { label: 'Careers', to: '/careers' },
                { label: 'Sustainability', to: '/sustainability' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' },
              ],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                  marginBottom: '20px',
                }}
              >
                {title}
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255,255,255,0.55)',
                        transition: 'color 0.3s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-white)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '20px',
              }}
            >
              Newsletter
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', lineHeight: 1.7 }}>
              Subscribe for exclusive offers and style inspiration.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="email"
                placeholder="Your email"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  color: 'var(--color-white)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px',
                  background: 'var(--color-gold)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'var(--color-white)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1rem',
                  transition: 'background 0.3s',
                }}
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 0',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} LUXE Clothing. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {['visa', 'mastercard', 'upi', 'paypal'].map((method) => (
              <span
                key={method}
                style={{
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
