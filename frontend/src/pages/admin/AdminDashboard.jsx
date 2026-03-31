import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiUsers, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const statusColors = {
  pending: '#c97b2e',
  confirmed: '#2563eb',
  processing: '#2563eb',
  shipped: '#2d6a4f',
  delivered: '#2d6a4f',
  cancelled: '#b5303a',
};

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/orders/admin/dashboard').then((r) => r.data),
  });

  const stats = [
    { label: 'Total Revenue', value: `₹${(data?.stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', change: '+12.5%', up: true, color: 'var(--color-gold)' },
    { label: 'Total Orders', value: data?.stats?.totalOrders || 0, icon: '📦', change: '+8.2%', up: true, color: '#2563eb' },
    { label: 'Total Customers', value: data?.stats?.totalUsers || 0, icon: '👥', change: '+15.3%', up: true, color: '#2d6a4f' },
    { label: 'Active Products', value: data?.stats?.totalProducts || 0, icon: '👗', change: '+3.4%', up: true, color: 'var(--color-gold-dark)' },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="stats-grid">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">+ Add Product</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className="stat-icon">{stat.icon}</span>
              <span
                className={`stat-change ${stat.up ? 'up' : 'down'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8125rem', background: stat.up ? 'rgba(45,106,79,0.08)' : 'rgba(181,48,58,0.08)', padding: '4px 8px', borderRadius: '4px' }}
              >
                <FiTrendingUp size={12} />
                {stat.change}
              </span>
            </div>
            <p className="stat-value" style={{ color: stat.color }}>{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Order Status Overview */}
      {data?.ordersByStatus && (
        <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '20px' }}>Orders by Status</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {data.ordersByStatus.map(({ _id, count }) => (
              <div
                key={_id}
                style={{
                  padding: '12px 20px',
                  background: 'var(--color-off-white)',
                  borderRadius: '10px',
                  textAlign: 'center',
                  minWidth: '120px',
                  borderLeft: `4px solid ${statusColors[_id] || 'var(--color-gray-300)'}`,
                }}
              >
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 500, color: statusColors[_id] || 'var(--color-dark)', lineHeight: 1 }}>{count}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '4px', textTransform: 'capitalize', letterSpacing: '0.04em' }}>{_id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div style={{ background: 'var(--color-white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--color-gray-100)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400 }}>Recent Orders</h2>
          <Link to="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-dark)', fontSize: '0.875rem', fontWeight: 500 }}>
            View All <FiArrowRight size={14} />
          </Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.recentOrders?.map((order) => (
              <tr key={order._id}>
                <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                <td>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{order.user?.name}</p>
                    <p style={{ color: 'var(--color-gray-400)', fontSize: '0.8125rem' }}>{order.user?.email}</p>
                  </div>
                </td>
                <td style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td>
                  <span className={`order-status status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>₹{order.pricing?.total?.toLocaleString()}</td>
                <td>
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '6px 14px' }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
        {[
          { label: 'Add New Product', to: '/admin/products/new', icon: <FiPackage />, color: 'var(--color-gold)' },
          { label: 'Manage Orders', to: '/admin/orders', icon: <FiShoppingBag />, color: '#2563eb' },
          { label: 'View Customers', to: '/admin/users', icon: <FiUsers />, color: '#2d6a4f' },
        ].map(({ label, to, icon, color }) => (
          <Link
            key={label}
            to={to}
            style={{
              background: 'var(--color-white)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-gray-100)',
              color: 'var(--color-dark)',
              textDecoration: 'none',
              transition: 'all 0.2s',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: 40, height: 40, borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '1.125rem' }}>
              {icon}
            </div>
            {label}
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
