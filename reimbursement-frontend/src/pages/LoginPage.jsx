import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ addToast }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const countryOptions = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'India',
    'Germany',
    'France',
    'Spain',
    'Italy',
    'Netherlands',
    'Brazil',
    'Mexico',
    'Japan',
    'China',
    'South Korea',
    'Singapore',
    'United Arab Emirates',
    'South Africa',
    'Nigeria',
  ];

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',     // default to admin only
    companyName: '',      // NEW: required by backend signup
    country: '',
  });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        addToast({ type: 'success', message: 'Welcome back!' });
      } else {
        // IMPORTANT: send companyName to /auth/register
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          companyName: form.companyName,
          country: form.country,
        });
        addToast({ type: 'success', message: 'Account created successfully!' });
      }
      navigate('/dashboard');
    } catch (err) {
      addToast({
        type: 'error',
        message: err.response?.data?.message ?? 'Authentication failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className="auth-logo">
          Reimburse<span>Flow</span>
        </div>
        <p className="auth-tagline">
          Smart expense management for modern teams
        </p>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: 8,
                background:
                  tab === t ? 'var(--accent)' : 'var(--bg-card)',
                border: `1px solid ${
                  tab === t ? 'var(--accent)' : 'var(--border)'
                }`,
                color: tab === t ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'login' ? '🔑 Sign In' : '✨ Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  className="form-input"
                  name="companyName"
                  placeholder="Acme Corporation"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <select
                  className="form-select"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select your country
                  </option>
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role selector can be kept for UI but is not used in /auth/register now */}
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            type="submit"
            disabled={loading}
          >
            {loading
              ? '⏳ Please wait…'
              : tab === 'login'
              ? '🚀 Sign In'
              : '✨ Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}