import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../../components/Badges';
import { FiPlusCircle, FiList, FiBell, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/my').then(r => {
      setComplaints(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const total = complaints.length;
  const open = complaints.filter(c => c.status === 'Open').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const recent = complaints.slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name} 👋</h1>
          <p className="text-muted text-sm mt-2">Here's an overview of your maintenance requests</p>
        </div>
        <Link to="/resident/raise" className="btn btn-primary">
          <FiPlusCircle /> Raise Complaint
        </Link>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Complaints', value: total, icon: '📋', bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
          { label: 'Open', value: open, icon: '🔵', bg: 'rgba(14,165,233,0.15)', color: '#38bdf8' },
          { label: 'In Progress', value: inProgress, icon: '🟡', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
          { label: 'Resolved', value: resolved, icon: '✅', bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <div className="value" style={{ color: s.color }}>{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3>Recent Complaints</h3>
          <Link to="/resident/complaints" className="btn btn-secondary btn-sm">
            <FiList /> View All
          </Link>
        </div>

        {loading ? <div className="spinner" /> : recent.length === 0 ? (
          <div className="text-center" style={{ padding: '40px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
            <p className="text-muted">No complaints yet.</p>
            <Link to="/resident/raise" className="btn btn-primary mt-4">Raise your first complaint</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th><th>Category</th><th>Status</th><th>Priority</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(c => (
                  <tr key={c._id} className={c.isOverdue ? 'overdue' : ''}>
                    <td>
                      <Link to={`/resident/complaints/${c._id}`} style={{ color: 'var(--primary-light)', fontWeight: 500 }}>
                        {c.title}
                      </Link>
                      {c.isOverdue && <span className="ml-2"><OverdueBadge /></span>}
                    </td>
                    <td className="text-muted">{c.category}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td className="text-subtle text-sm">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
