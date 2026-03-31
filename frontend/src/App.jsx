import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/common/RouteGuards';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import CheckoutPage from './pages/CheckoutPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';

import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
});

// Auth Success Handler (Google OAuth redirect)
const AuthSuccessHandler = () => {
  const [searchParams] = useSearchParams();
  const setToken = useAuthStore((s) => s.setToken);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      fetchMe();
      fetchCart();
      window.location.href = '/';
    }
  }, []);

  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Signing you in...</div>;
};

// Layout wrapper that adds Navbar/Footer for public pages
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
    <CartDrawer />
  </>
);

const AppContent = () => {
  const { isAuthenticated, fetchMe } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchMe().then(() => {
        if (isAuthenticated) fetchCart();
      });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
      <Route path="/products/:slug" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />

      {/* Auth */}
      <Route path="/login" element={<GuestRoute><AuthPage mode="login" /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><AuthPage mode="register" /></GuestRoute>} />
      <Route path="/auth/success" element={<AuthSuccessHandler />} />

      {/* Protected User */}
      <Route path="/account" element={<ProtectedRoute><PublicLayout><AccountPage /></PublicLayout></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><PublicLayout><CheckoutPage /></PublicLayout></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
      <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <PublicLayout>
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '5rem', marginBottom: '24px' }}>404</div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '12px' }}>Page Not Found</h1>
              <p style={{ color: 'var(--color-gray-400)', marginBottom: '24px' }}>The page you're looking for doesn't exist.</p>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          </PublicLayout>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-gray-100)',
            },
            success: {
              iconTheme: { primary: 'var(--color-dark)', secondary: 'white' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
