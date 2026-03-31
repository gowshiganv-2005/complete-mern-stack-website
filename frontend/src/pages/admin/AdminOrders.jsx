import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search, statusFilter],
    queryFn: () =>
      api.get(`/orders/admin/all?page=${page}&limit=15&search=${search}&status=${statusFilter}`).then((r) => r.data),
  });

  const handleStatusUpdate = async (orderId, status, trackingNumber) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status, trackingNumber });
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order status updated');
      setSelectedOrder(null);
    } catch {
      toast.error('Failed to update order');
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Orders</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1); }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: statusFilter === s ? 'var(--color-dark)' : 'var(--color-gray-200)',
                background: statusFilter === s ? 'var(--color-dark)' : 'transparent',
                color: statusFilter === s ? 'white' : 'var(--color-gray-500)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ background: 'var(--color-white)', borderRadius: '12px', padding: '14px 20px', boxShadow: 'var(--shadow-sm)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <FiSearch size={18} style={{ color: 'var(--color-gray-400)' }} />
        <input
          type="text"
          placeholder="Search by order number..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9375rem', background: 'transparent' }}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div>{Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '8px', borderRadius: '8px' }} />)}</div>
      ) : (
        <div style={{ background: 'var(--color-white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders?.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{order.orderNumber}</td>
                  <td>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{order.user?.name}</p>
                      <p style={{ color: 'var(--color-gray-400)', fontSize: '0.75rem' }}>{order.user?.email}</p>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ fontWeight: 500 }}>{order.items?.length}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className={`order-status status-${order.status}`}
                      style={{ border: 'none', cursor: 'pointer', background: 'none', fontWeight: 500, fontSize: '0.75rem' }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s} style={{ background: 'white', color: 'var(--color-dark)', textTransform: 'capitalize' }}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`order-status status-${order.paymentInfo?.status}`}>
                      {order.paymentInfo?.method?.toUpperCase()} · {order.paymentInfo?.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{order.pricing?.total?.toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-gray-200)', background: 'none', cursor: 'pointer', display: 'flex', color: 'var(--color-dark)' }}
                      title="View Details"
                    >
                      <FiEye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.orders?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-gray-400)' }}>
              No orders found
            </div>
          )}

          {/* Pagination */}
          {data?.pagination?.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((pg) => (
                <button key={pg} onClick={() => setPage(pg)} style={{ width: 36, height: 36, border: `1px solid ${page === pg ? 'var(--color-dark)' : 'var(--color-gray-200)'}`, borderRadius: '6px', background: page === pg ? 'var(--color-dark)' : 'transparent', color: page === pg ? 'white' : 'var(--color-dark)', cursor: 'pointer', fontSize: '0.875rem' }}>
                  {pg}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400 }}>
                Order {selectedOrder.orderNumber}
              </h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-gray-400)' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--color-off-white)', borderRadius: '10px', padding: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Customer</p>
                <p style={{ fontWeight: 600 }}>{selectedOrder.user?.name}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)' }}>{selectedOrder.user?.email}</p>
              </div>
              <div style={{ background: 'var(--color-off-white)', borderRadius: '10px', padding: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Shipping</p>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedOrder.shippingAddress?.fullName}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', lineHeight: 1.5 }}>
                  {selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '10px' }}>Items ({selectedOrder.items?.length})</p>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-gray-100)', fontSize: '0.875rem' }}>
                  <span>{item.name} × {item.quantity} ({item.size}/{item.color})</span>
                  <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--color-off-white)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.0625rem' }}>
                <span>Total</span>
                <span>₹{selectedOrder.pricing?.total?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                defaultValue={selectedOrder.status}
                id="update-status"
                className="form-input form-select"
                style={{ flex: 1 }}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const status = document.getElementById('update-status').value;
                  handleStatusUpdate(selectedOrder._id, status);
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
