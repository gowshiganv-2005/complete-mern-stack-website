import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import useAuthStore from '../store/authStore';

const AuthPage = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const { login, register: registerUser, forgotPassword, isLoading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (mode === 'login') {
      const res = await login(data);
      if (res.success) {
        navigate(res.user?.role === 'admin' ? '/admin' : '/');
      }
    } else {
      const res = await registerUser(data);
      if (res.success) navigate('/');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    await forgotPassword(forgotEmail);
    setShowForgot(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden',
      }}
    >
      {/* Left Panel - Decorative */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1814 0%, #2d2924 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,169,110,0.12), transparent 70%)',
            top: '-100px',
            right: '-100px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,169,110,0.08), transparent 70%)',
            bottom: '-50px',
            left: '-50px',
          }}
        />
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            letterSpacing: '0.2em',
            color: 'var(--color-white)',
            marginBottom: '48px',
            position: 'relative',
          }}
        >
          LUXE
        </Link>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>
            {mode === 'login' ? '✨' : '🎉'}
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.2rem',
              fontWeight: 400,
              color: 'var(--color-white)',
              lineHeight: 1.3,
              marginBottom: '16px',
            }}
          >
            {mode === 'login' ? 'Welcome\nBack' : 'Join the\nLUXE Family'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '320px' }}>
            {mode === 'login'
              ? 'Sign in to access your premium shopping experience and exclusive offers.'
              : 'Create your account and unlock a world of timeless fashion and exclusive member benefits.'}
          </p>
        </div>

        {/* Features */}
        <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '300px', position: 'relative' }}>
          {[
            { icon: '🚚', text: 'Free shipping on ₹999+' },
            { icon: '↩️', text: '30-day easy returns' },
            { icon: '💎', text: 'Exclusive member deals' },
          ].map((f) => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          background: 'var(--color-white)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              fontWeight: 400,
              marginBottom: '8px',
              color: 'var(--color-dark)',
            }}
          >
            {showForgot ? 'Forgot Password' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </h1>
          <p style={{ color: 'var(--color-gray-400)', marginBottom: '32px', fontSize: '0.9rem' }}>
            {showForgot
              ? 'Enter your email to receive a reset link.'
              : mode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            {!showForgot && (
              <Link
                to={mode === 'login' ? '/register' : '/login'}
                style={{ color: 'var(--color-dark)', fontWeight: 600, textDecoration: 'underline' }}
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </Link>
            )}
          </p>

          {/* Forgot Password Form */}
          {showForgot ? (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FiMail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
                  <input
                    type="email"
                    className="form-input"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={{ paddingLeft: '42px' }}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => setShowForgot(false)} className="btn btn-ghost text-center" style={{ width: '100%' }}>
                Back to Login
              </button>
            </form>
          ) : (
            <>
              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1.5px solid var(--color-gray-200)',
                  borderRadius: '8px',
                  background: 'var(--color-white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '20px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-dark)',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-gray-400)'; e.currentTarget.style.background = 'var(--color-off-white)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-gray-200)'; e.currentTarget.style.background = 'var(--color-white)'; }}
              >
                <FcGoogle size={22} />
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-gray-100)' }} />
                <span style={{ color: 'var(--color-gray-400)', fontSize: '0.8125rem' }}>or continue with email</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-gray-100)' }} />
              </div>

              {/* Main Form */}
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {mode === 'register' && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <FiUser style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
                      <input
                        {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })}
                        className={`form-input ${errors.name ? 'error' : ''}`}
                        placeholder="Your full name"
                        style={{ paddingLeft: '42px' }}
                      />
                    </div>
                    {errors.name && <p className="form-error">{errors.name.message}</p>}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <FiMail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                      })}
                      type="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="your@email.com"
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <FiLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'At least 6 characters' },
                      })}
                      type={showPass ? 'text' : 'password'}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="••••••••"
                      style={{ paddingLeft: '42px', paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-gray-400)', cursor: 'pointer' }}
                    >
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && <p className="form-error">{errors.password.message}</p>}
                </div>

                {mode === 'register' && (
                  <div className="form-group">
                    <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                      <input type="checkbox" required style={{ marginTop: '2px', accentColor: 'var(--color-dark)' }} />
                      <span>
                        I agree to the{' '}
                        <Link to="/terms" style={{ color: 'var(--color-dark)', textDecoration: 'underline' }}>Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" style={{ color: 'var(--color-dark)', textDecoration: 'underline' }}>Privacy Policy</Link>
                      </span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '16px',
                    fontSize: '0.875rem',
                    letterSpacing: '0.12em',
                    marginTop: '4px',
                  }}
                >
                  {isLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                      {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                    </span>
                  ) : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="background: linear-gradient(135deg, #1a1814"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
