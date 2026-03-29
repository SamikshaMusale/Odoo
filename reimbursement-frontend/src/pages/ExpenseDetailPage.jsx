import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ExpenseDetailPage({ addToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isManager, user } = useAuth();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [actioning, setActioning] = useState(false);

  const load = () => {
    api.get(`/expenses/${id}`)
      .then(res => setExpense(res.data.data ?? res.data))
      .catch(() => navigate('/expenses'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleAction = async (action) => {
    setActioning(true);
    try {
      await api.post(`/approvals/${id}/${action}`, { comment });
      addToast({ type: 'success', message: `Expense ${action}d successfully` });
      load();
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message ?? 'Action failed' });
    } finally {
      setActioning(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!expense) return null;

  const canAct = (isAdmin || isManager) && expense.status === 'PENDING';

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 className="page-title">{expense.title}</h1>
          <p className="page-subtitle">Submitted {new Date(expense.createdAt).toLocaleDateString()}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StatusBadge status={expense.status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Main details */}
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Expense Details</h2>
          <Detail label="Category"    value={expense.category?.replace('_',' ')} />
          <Detail label="Amount"      value={`₹${Number(expense.amount).toFixed(2)}`} />
          <Detail label="Date"        value={expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : '—'} />
          <Detail label="Submitted by" value={expense.submittedBy?.name ?? expense.user?.name ?? '—'} />
          {expense.description && <Detail label="Description" value={expense.description} />}
          {expense.receiptUrl && (
            <div style={{ marginTop: 16 }}>
              <a href={expense.receiptUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">📎 View Receipt</a>
            </div>
          )}
        </div>

        {/* Approval actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {canAct && (
            <div className="card">
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Take Action</h2>
              <div className="form-group">
                <label className="form-label">Comment (optional)</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 80 }}
                  placeholder="Add a note…"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-success" disabled={actioning} onClick={() => handleAction('approve')} style={{ flex: 1, justifyContent: 'center' }}>
                  ✅ Approve
                </button>
                <button className="btn btn-danger" disabled={actioning} onClick={() => handleAction('reject')} style={{ flex: 1, justifyContent: 'center' }}>
                  ❌ Reject
                </button>
              </div>
            </div>
          )}

          {/* Approval history */}
          {expense.approvals?.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Approval History</h2>
              {expense.approvals.map((a, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>{a.approver?.name ?? 'Unknown'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(a.createdAt).toLocaleDateString()}</div>
                  <StatusBadge status={a.status} />
                  {a.comment && <p style={{ marginTop: 6, color: 'var(--text-secondary)' }}>{a.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14, gap: 12 }}>
      <span style={{ color: 'var(--text-muted)', width: 130, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
