import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiList } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  if (!stats) return <p className="text-muted">Failed to load dashboard.</p>;

  const { total, byStatus, byCategory, overdueCount } = stats;

  const statCards = [
    { label: 'Total Complaints', value: total, icon: '📋', bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
    { label: 'Open', value: byStatus['Open'] || 0, icon: '🔵', bg: 'rgba(14,165,233,0.15)', color: '#38bdf8' },
    { label: 'In Progress', value: byStatus['In Progress'] || 0, icon: '🟡', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    { label: 'Resolved', value: byStatus['Resolved'] || 0, icon: '✅', bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
    { label: 'Overdue', value: overdueCount, icon: '⚠', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  ];

  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...categories.map(([, v]) => v), 1);

  const BAR_COLORS = ['#818cf8','#38bdf8','#34d399','#fbbf24','#f87171','#a78bfa','#fb923c','#94a3b8'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-muted text-sm mt-2">Overview of all maintenance activity</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color, fontSize: '1.4rem' }}>{s.icon}</div>
            <div className="stat-info">
              <div className="value" style={{ color: s.color }}>{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* By Status */}
        <div className="card">
          <h3 className="mb-4">Complaints by Status</h3>
          <div className="bar-chart">
            {[
              { label: 'Open', value: byStatus['Open'] || 0, color: '#38bdf8' },
              { label: 'In Progress', value: byStatus['In Progress'] || 0, color: '#fbbf24' },
              { label: 'Resolved', value: byStatus['Resolved'] || 0, color: '#34d399' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bar-item">
                <div className="bar-label"><span>{label}</span><span style={{ color }}>{value}</span></div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${total ? (value / total) * 100 : 0}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Category */}
        <div className="card">
          <h3 className="mb-4">Complaints by Category</h3>
          {categories.length === 0 ? <p className="text-muted text-sm">No data yet.</p> : (
            <div className="bar-chart">
              {categories.map(([cat, count], i) => (
                <div key={cat} className="bar-item">
                  <div className="bar-label"><span>{cat}</span><span style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>{count}</span></div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(count / maxCat) * 100}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="card mt-4" style={{ borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.05)' }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '1.5rem' }}>⚠</span>
            <div>
              <h4 style={{ color: '#f87171' }}>Overdue Alert</h4>
              <p className="text-muted text-sm">
                {overdueCount} complaint{overdueCount !== 1 ? 's are' : ' is'} overdue and require{overdueCount === 1 ? 's' : ''} attention.
                <a href="/admin/complaints" style={{ color: '#f87171', marginLeft: 6 }}>View now →</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
