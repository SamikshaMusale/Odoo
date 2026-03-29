import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, PlusCircle, LogOut } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Approve', path: '/approvals', icon: <CheckSquare size={20} /> },
    { name: 'New Expense', path: '/new-expense', icon: <PlusCircle size={20} /> },
  ];

  return (
    <div className="layout-container flex">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header flex items-center justify-center">
          <h1 className="brand-text">Reimburse</h1>
        </div>

        <nav className="sidebar-nav flex-col">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-item flex items-center gap-4 transition-fast ${
                  isActive ? 'active' : ''
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="btn nav-item flex items-center gap-4 w-full">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content flex-col">
        {/* Header */}
        <header className="top-header flex items-center justify-between">
          <div className="header-title">
            <h2>{navItems.find(i => location.pathname.startsWith(i.path))?.name || 'Overview'}</h2>
          </div>
          <div className="user-profile flex items-center gap-4">
            <span className="user-role badge badge-approved">Role: Admin</span>
            <div className="avatar">AD</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="content-area">
          <div className="container animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
