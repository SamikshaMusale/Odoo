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
    api.get('/approvals/pending')
      .then(res => {
        const data = res.data.approvals ?? res.data ?? [];
        setPending(Array.isArray(data) ? data : []);
      })
      .catch(() => setPending([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAction = async (stepId, action) => {
    setActioning(p => ({ ...p, [stepId]: action }));
    try {
      await api.post(`/approvals/${stepId}/${action}`, {});
      addToast({ type: 'success', message: `Expense ${action}d` });
      await load();
    } catch (err) {
      addToast({ type: 'error', message: err.message ?? 'Action failed' });
    } finally {
      setActioning(p => { const n = {...p}; delete n[stepId]; return n; });
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
          {pending.map(step => {
            const exp = step.expense;
            return (
            <div className="card" key={step.id} style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Link to={`/expenses/${exp.id}`} style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                    {exp.description || `Expense #${exp.id.slice(0, 8)}`}
                  </Link>
                  <StatusBadge status={exp.status} />
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>👤 {exp.user?.name ?? '—'}</span>
                  <span>🏷️ {exp.category?.replace('_',' ')}</span>
                  <span>📅 {exp.date ? new Date(exp.date).toLocaleDateString() : '—'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <span style={{ fontWeight: 800, fontSize: 18 }}>₹{Number(exp.amount).toFixed(2)}</span>
                <button
                  className="btn btn-success btn-sm"
                  disabled={!!actioning[step.id]}
                  onClick={() => handleAction(step.id, 'approve')}
                >
                  {actioning[step.id] === 'approve' ? '⏳' : '✅'} Approve
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={!!actioning[step.id]}
                  onClick={() => handleAction(step.id, 'reject')}
                >
                  {actioning[step.id] === 'reject' ? '⏳' : '❌'} Reject
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
