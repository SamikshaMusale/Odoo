import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard',    icon: '🏠', label: 'Dashboard' },
  { to: '/expenses',     icon: '📋', label: 'Expenses' },
  { to: '/expenses/new', icon: '➕', label: 'New Expense' },
  { to: '/approvals',    icon: '✅', label: 'Approvals',  roles: ['ADMIN','MANAGER'] },
  { to: '/users',        icon: '👥', label: 'Users',      roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const visible = navItems.filter(item => {
    if (!item.roles) return true;
    if (isAdmin)   return true;
    if (isManager) return item.roles.includes('MANAGER');
    return false;
  });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
    : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Reimburse<span>Flow</span></div>

      <nav className="sidebar-nav">
        {visible.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div className="user-name">{user?.name ?? 'User'}</div>
          <div className="user-role">{user?.role ?? ''}</div>
        </div>
        <button className="logout-btn" title="Logout" onClick={handleLogout}>⏻</button>
      </div>
    </aside>
  );
}
