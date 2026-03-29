import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';

const ROLE_COLORS = { ADMIN: '#6366f1', MANAGER: '#06b6d4', EMPLOYEE: '#22c55e' };

export default function UsersPage({ addToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users')
      .then(res => {
        const data = res.data.data ?? res.data;
        setUsers(Array.isArray(data) ? data : data?.users ?? []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/users/${userId}`, { role });
      setUsers(p => p.map(u => u.id === userId ? { ...u, role } : u));
      addToast({ type: 'success', message: 'Role updated successfully' });
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message ?? 'Update failed' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Users 👥</h1>
        <p className="page-subtitle">{users.length} registered users</p>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p>No users found.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${ROLE_COLORS[u.role] ?? '#6366f1'}, #0d0f1a)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 12, flexShrink: 0,
                      }}>
                        {u.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: `${ROLE_COLORS[u.role]}22`,
                      color: ROLE_COLORS[u.role] ?? 'var(--text-primary)',
                      border: `1px solid ${ROLE_COLORS[u.role]}44`,
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ width: 140, padding: '6px 10px' }}
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
