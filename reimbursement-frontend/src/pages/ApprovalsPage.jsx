import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ApprovalsPage({ addToast }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState({});

  const load = () => {
    api.get('/expenses?status=PENDING')
      .then(res => {
        const data = res.data.data ?? res.data;
        setPending(Array.isArray(data) ? data : data?.expenses ?? []);
      })
      .catch(() => setPending([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAction = async (expId, action) => {
    setActioning(p => ({ ...p, [expId]: action }));
    try {
      await api.post(`/approvals/${expId}/${action}`, {});
      addToast({ type: 'success', message: `Expense ${action}d` });
      setPending(p => p.filter(e => e.id !== expId));
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message ?? 'Action failed' });
    } finally {
      setActioning(p => { const n = {...p}; delete n[expId]; return n; });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Approvals Queue ✅</h1>
        <p className="page-subtitle">{pending.length} expense{pending.length !== 1 ? 's' : ''} awaiting your action</p>
      </div>

      {pending.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🎉</div>
          <p>All caught up! No pending approvals.</p>
        </div>
      ) : (
        <div className="expense-grid">
          {pending.map(exp => (
            <div className="card" key={exp.id} style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Link to={`/expenses/${exp.id}`} style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                    {exp.title}
                  </Link>
                  <StatusBadge status={exp.status} />
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>👤 {exp.submittedBy?.name ?? exp.user?.name ?? '—'}</span>
                  <span>🏷️ {exp.category?.replace('_',' ')}</span>
                  <span>📅 {exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString() : '—'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <span style={{ fontWeight: 800, fontSize: 18 }}>₹{Number(exp.amount).toFixed(2)}</span>
                <button
                  className="btn btn-success btn-sm"
                  disabled={!!actioning[exp.id]}
                  onClick={() => handleAction(exp.id, 'approve')}
                >
                  {actioning[exp.id] === 'approve' ? '⏳' : '✅'} Approve
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={!!actioning[exp.id]}
                  onClick={() => handleAction(exp.id, 'reject')}
                >
                  {actioning[exp.id] === 'reject' ? '⏳' : '❌'} Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
