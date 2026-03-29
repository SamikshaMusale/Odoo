import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORY_ICONS = {
  TRAVEL: '✈️', FOOD: '🍽️', ACCOMMODATION: '🏨',
  OFFICE_SUPPLIES: '🖊️', MEDICAL: '🏥', TRAINING: '📚', OTHER: '📦',
};

export default function ExpenseListPage() {
  const { isAdmin, isManager } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.get('/expenses')
      .then(res => {
        const data = res.data.data ?? res.data;
        setExpenses(Array.isArray(data) ? data : data?.expenses ?? []);
      })
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false));
  }, []);

  const FILTERS = ['ALL','PENDING','APPROVED','REJECTED'];
  const filtered = filter === 'ALL' ? expenses : expenses.filter(e => e.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Expenses 📋</h1>
          <p className="page-subtitle">{expenses.length} total expenses</p>
        </div>
        <Link to="/expenses/new" className="btn btn-primary">➕ New Expense</Link>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>No expenses found.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Expense</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(exp => (
                <tr key={exp.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{exp.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {exp.submittedBy?.name ?? exp.user?.name ?? '—'}
                    </div>
                  </td>
                  <td>{CATEGORY_ICONS[exp.category]} {exp.category?.replace('_',' ')}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{Number(exp.amount).toFixed(2)}</td>
                  <td><StatusBadge status={exp.status} /></td>
                  <td>
                    <Link to={`/expenses/${exp.id}`} className="btn btn-secondary btn-sm">View →</Link>
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
