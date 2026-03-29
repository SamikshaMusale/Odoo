import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';

const CATEGORIES = ['TRAVEL','FOOD','ACCOMMODATION','OFFICE_SUPPLIES','MEDICAL','TRAINING','OTHER'];

export default function SubmitExpensePage({ addToast }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: '', category: 'TRAVEL',
    description: '', date: '',
  });

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) {
      addToast({ type: 'error', message: 'Please fill all required fields' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/expenses', {
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description,
        date: new Date(form.date).toISOString().split('T')[0], // Convert to YYYY-MM-DD
      });
      addToast({ type: 'success', message: 'Expense submitted successfully!' });
      navigate('/expenses');
    } catch (err) {
      addToast({ type: 'error', message: err.message ?? 'Failed to submit expense' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Submit Expense ➕</h1>
        <p className="page-subtitle">Fill in the details for your reimbursement request.</p>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input className="form-input" name="amount" type="number" min="1" step="0.01" placeholder="0.00" value={form.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expense Date *</label>
            <input className="form-input" name="date" type="date" value={form.date} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" placeholder="Provide additional details…" value={form.description} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Submitting…' : '🚀 Submit Expense'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
