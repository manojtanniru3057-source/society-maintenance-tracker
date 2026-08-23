export function StatusBadge({ status }) {
  const map = {
    'Open': 'badge badge-open',
    'In Progress': 'badge badge-inprogress',
    'Resolved': 'badge badge-resolved',
  };
  return <span className={map[status] || 'badge'}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  const map = {
    'High': 'badge badge-high',
    'Medium': 'badge badge-medium',
    'Low': 'badge badge-low',
  };
  return <span className={map[priority] || 'badge'}>{priority}</span>;
}

export function OverdueBadge() {
  return <span className="badge badge-overdue">⚠ Overdue</span>;
}
