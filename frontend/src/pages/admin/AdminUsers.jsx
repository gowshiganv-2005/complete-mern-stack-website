import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiUserX, FiShield } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const AdminUsers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () =>
      api.get(`/users/admin?page=${page}&limit=15&search=${search}`).then((r) => r.data),
  });

  const handleRoleToggle = async (userId, currentRole) => {
    if (userId === currentUser._id) { toast.error("Can't change your own role"); return; }
    if (!window.confirm(`Change role to ${currentRole === 'admin' ? 'user' : 'admin'}?`)) return;
    try {
      await api.put(`/users/admin/${userId}`, { role: currentRole === 'admin' ? 'user' : 'admin' });
      queryClient.invalidateQueries(['admin-users']);
      toast.success('Role updated');
    } catch { toast.error('Failed'); }
  };

  const handleToggleActive = async (userId, isActive) => {
    if (userId === currentUser._id) { toast.error("Can't deactivate yourself"); return; }
    try {
      await api.put(`/users/admin/${userId}`, { isActive: !isActive });
      queryClient.invalidateQueries(['admin-users']);
      toast.success(isActive ? 'User deactivated' : 'User activated');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (userId, name) => {
    if (userId === currentUser._id) { toast.error("Can't delete yourself"); return; }
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      await api.delete(`/users/admin/${userId}`);
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          Customers
          {data && <span style={{ fontSize: '1rem', color: 'var(--color-gray-400)', fontFamily: 'var(--font-sans)', fontWeight: 400, marginLeft: '10px' }}>({data.pagination.total} total)</span>}
        </h1>
      </div>

      <div style={{ background: 'var(--color-white)', borderRadius: '12px', padding: '14px 20px', boxShadow: 'var(--shadow-sm)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <FiSearch size={18} style={{ color: 'var(--color-gray-400)' }} />
        <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9375rem', background: 'transparent' }} />
      </div>

      {isLoading ? (
        <div>{Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '8px', borderRadius: '8px' }} />)}</div>
      ) : (
        <div style={{ background: 'var(--color-white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: u.avatar ? `url(${u.avatar}) center/cover` : 'var(--color-dark)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0,
                      }}>
                        {!u.avatar && u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</p>
                        <p style={{ color: 'var(--color-gray-400)', fontSize: '0.75rem' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`tag ${u.role === 'admin' ? 'tag-gold' : 'tag-primary'}`} style={{ textTransform: 'capitalize' }}>
                      {u.role === 'admin' ? '👑 ' : ''}{u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span className={u.isActive ? 'tag tag-success' : 'tag tag-error'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        title={u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-gray-200)', background: 'none', cursor: 'pointer', color: u.role === 'admin' ? 'var(--color-gold)' : 'var(--color-gray-500)', display: 'flex' }}
                      >
                        <FiShield size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        title={u.isActive ? 'Deactivate User' : 'Activate User'}
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-gray-200)', background: 'none', cursor: 'pointer', color: 'var(--color-gray-500)', display: 'flex', fontSize: '0.875rem' }}
                      >
                        {u.isActive ? '🔒' : '🔓'}
                      </button>
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        title="Delete User"
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(181,48,58,0.2)', background: 'none', cursor: 'pointer', color: 'var(--color-error)', display: 'flex' }}
                      >
                        <FiUserX size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.users?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-gray-400)' }}>No users found</div>
          )}

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
    </AdminLayout>
  );
};

export default AdminUsers;
