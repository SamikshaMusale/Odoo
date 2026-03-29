import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SubmitExpensePage from './pages/SubmitExpensePage';
import ExpenseListPage from './pages/ExpenseListPage';
import ExpenseDetailPage from './pages/ExpenseDetailPage';
import ApprovalsPage from './pages/ApprovalsPage';
import UsersPage from './pages/UsersPage';

let _toastId = 0;

export default function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type, message }) => {
    const id = ++_toastId;
    setToasts(p => [...p, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage addToast={addToast} />} />

          {/* Protected — with sidebar layout */}
          <Route
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Outlet />
                  </main>
                </div>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/expenses"     element={<ExpenseListPage />} />
            <Route path="/expenses/new" element={<SubmitExpensePage addToast={addToast} />} />
            <Route path="/expenses/:id" element={<ExpenseDetailPage addToast={addToast} />} />
            <Route
              path="/approvals"
              element={
                <ProtectedRoute roles={['ADMIN','MANAGER']}>
                  <ApprovalsPage addToast={addToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <UsersPage addToast={addToast} />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toast toasts={toasts} removeToast={removeToast} />
    </AuthProvider>
  );
}
