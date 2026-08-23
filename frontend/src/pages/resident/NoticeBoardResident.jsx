import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { format } from 'date-fns';

export default function NoticeBoardResident() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notices').then(r => { setNotices(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notice Board</h1>
          <p className="text-muted text-sm mt-2">Stay updated with society announcements</p>
        </div>
      </div>

      {loading ? <div className="spinner" /> : notices.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
          <p className="text-muted">No notices posted yet.</p>
        </div>
      ) : (
        notices.map(n => (
          <div key={n._id} className={`notice-card ${n.isImportant ? 'important' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              {n.isImportant && <span className="badge badge-important">⚠ Important</span>}
              <span className="text-subtle text-xs">
                {format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a')} · Posted by {n.postedBy?.name || 'Admin'}
              </span>
            </div>
            <h3 style={{ marginBottom: 8 }}>{n.title}</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{n.content}</p>
          </div>
        ))
      )}
    </div>
  );
}
