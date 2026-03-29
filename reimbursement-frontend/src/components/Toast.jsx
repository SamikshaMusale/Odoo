import { useEffect } from 'react';

const ICONS = { success: '✅', error: '❌', info: 'ℹ️' };

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className={`toast toast-${toast.type}`} onClick={() => onRemove(toast.id)}>
      <span>{ICONS[toast.type]}</span>
      <span>{toast.message}</span>
    </div>
  );
}
