import { format } from 'date-fns';

const STATUS_COLORS = {
  'Open': { bg: 'rgba(14,165,233,0.15)', color: '#38bdf8', label: 'O' },
  'In Progress': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'P' },
  'Resolved': { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: '✓' },
};

export default function HistoryTimeline({ history = [] }) {
  if (!history.length) return <p className="text-muted text-sm">No history available.</p>;

  return (
    <div className="history-timeline">
      {history.map((entry, i) => {
        const sc = STATUS_COLORS[entry.status] || { bg: 'rgba(255,255,255,0.1)', color: '#94a3b8', label: '•' };
        return (
          <div key={i} className="history-entry">
            <div className="history-dot" style={{ background: sc.bg, color: sc.color, border: `2px solid ${sc.color}` }}>
              {sc.label}
            </div>
            <div className="history-body">
              <div className="flex items-center gap-2">
                <strong>{entry.status}</strong>
                <span className="actor">by {entry.changedByName}</span>
              </div>
              {entry.note && <div className="note">"{entry.note}"</div>}
              <div className="time">
                {format(new Date(entry.timestamp), 'MMM d, yyyy · h:mm a')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
