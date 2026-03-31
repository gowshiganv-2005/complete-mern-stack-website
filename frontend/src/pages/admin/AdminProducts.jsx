import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () =>
      api.get(`/products/admin/all?page=${page}&limit=15&search=${search}`).then((r) => r.data),
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      queryClient.invalidateQueries(['admin-products']);
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const toggleFeatured = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { isFeatured: !product.isFeatured });
      queryClient.invalidateQueries(['admin-products']);
      toast.success(product.isFeatured ? 'Removed from featured' : 'Added to featured');
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiPlus /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div style={{ background: 'var(--color-white)', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <FiSearch size={18} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9375rem', color: 'var(--color-dark)', background: 'transparent' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--color-gray-400)', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '8px', borderRadius: '8px' }} />
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--color-white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.products?.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 48, height: 56, borderRadius: '8px', overflow: 'hidden', background: 'var(--color-cream)', flexShrink: 0 }}>
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>👗</div>
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px' }}>{product.name}</p>
                        <p style={{ color: 'var(--color-gray-400)', fontSize: '0.75rem', textTransform: 'capitalize' }}>{product.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
                    {product.category?.name || '—'}
                  </td>
                  <td>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        ₹{(product.discountPrice || product.price).toLocaleString()}
                      </p>
                      {product.discountPrice && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', textDecoration: 'line-through' }}>
                          ₹{product.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: product.totalStock === 0 ? 'var(--color-error)'
                          : product.totalStock < 10 ? 'var(--color-warning)'
                          : 'var(--color-success)',
                      }}
                    >
                      {product.totalStock}
                    </span>
                  </td>
                  <td>
                    <span className={`tag ${product.isActive ? 'tag-success' : 'tag-error'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleFeatured(product)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                      }}
                      title={product.isFeatured ? 'Remove from featured' : 'Add to featured'}
                    >
                      {product.isFeatured ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link
                        to={`/products/${product.slug}`}
                        target="_blank"
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-gray-200)', display: 'flex', color: 'var(--color-gray-500)', transition: 'all 0.2s' }}
                        title="View"
                      >
                        <FiEye size={14} />
                      </Link>
                      <button
                        onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-gray-200)', display: 'flex', color: 'var(--color-dark)', background: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(181,48,58,0.2)', display: 'flex', color: 'var(--color-error)', background: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {data?.pagination?.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  style={{
                    width: 36,
                    height: 36,
                    border: `1px solid ${page === pg ? 'var(--color-dark)' : 'var(--color-gray-200)'}`,
                    borderRadius: '6px',
                    background: page === pg ? 'var(--color-dark)' : 'transparent',
                    color: page === pg ? 'white' : 'var(--color-dark)',
                    cursor: 'pointer',
                    fontWeight: page === pg ? 600 : 400,
                    fontSize: '0.875rem',
                  }}
                >
                  {pg}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
