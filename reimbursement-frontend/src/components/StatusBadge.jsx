const STATUS_MAP = {
  PENDING:  { label: 'Pending',  cls: 'badge-pending',  dot: '🟡' },
  APPROVED: { label: 'Approved', cls: 'badge-approved', dot: '🟢' },
  REJECTED: { label: 'Rejected', cls: 'badge-rejected', dot: '🔴' },
  DRAFT:    { label: 'Draft',    cls: 'badge-draft',    dot: '⚪' },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.DRAFT;
  return (
    <span className={`badge ${s.cls}`}>
      {s.dot} {s.label}
    </span>
  );
}
