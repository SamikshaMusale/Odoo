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

export default function DashboardPage() {
  const { user, isAdmin, isManager } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [expRes] = await Promise.all([
          api.get('/expenses?limit=5'),
        ]);
        const expenses = expRes.data.data ?? expRes.data;
        const list = Array.isArray(expenses) ? expenses : expenses?.expenses ?? [];
        setRecent(list.slice(0,5));

        const totalAmt = list.reduce((s, e) => s + Number(e.amount ?? 0), 0);
        const pending  = list.filter(e => e.status === 'PENDING').length;
        const approved = list.filter(e => e.status === 'APPROVED').length;
        const rejected = list.filter(e => e.status === 'REJECTED').length;
        setStats({ total: list.length, totalAmt, pending, approved, rejected });
      } catch {
        setStats({ total: 0, totalAmt: 0, pending: 0, approved: 0, rejected: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's what's happening with your expenses today.</p>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Expenses" value={stats.total} icon="📋" />
        <StatCard label="Total Amount" value={`₹${stats.totalAmt.toFixed(2)}`} icon="💰" />
        <StatCard label="Pending" value={stats.pending} icon="⏳" />
        <StatCard label="Approved" value={stats.approved} icon="✅" />
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Expenses</h2>
          <Link to="/expenses" className="btn btn-secondary btn-sm">View All →</Link>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No expenses yet. <Link to="/expenses/new" style={{ color: 'var(--accent-light)' }}>Submit your first one!</Link></p>
          </div>
        ) : (
          <div className="expense-grid">
            {recent.map(exp => (
              <Link to={`/expenses/${exp.id}`} key={exp.id} style={{ display: 'block' }}>
                <div className="expense-card">
                  <div className="expense-category-icon">
                    {CATEGORY_ICONS[exp.category] ?? '📦'}
                  </div>
                  <div className="expense-info">
                    <div className="expense-title">{exp.title}</div>
                    <div className="expense-meta">{exp.category} · {new Date(exp.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span className="expense-amount">₹{Number(exp.amount).toFixed(2)}</span>
                    <StatusBadge status={exp.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
}
