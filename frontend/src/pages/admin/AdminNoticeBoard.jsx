import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { format } from 'date-fns';
import { FiTrash2, FiPlus } from 'react-icons/fi';

export default function AdminNoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', isImportant: false });
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchNotices = () => {
    api.get('/notices').then(r => { setNotices(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error('Title and content are required'); return; }
    setPosting(true);
    try {
      const r = await api.post('/notices', form);
      setNotices(prev => [r.data, ...prev].sort((a, b) => (b.isImportant ? 1 : 0) - (a.isImportant ? 1 : 0)));
      setForm({ title: '', content: '', isImportant: false });
      setShowForm(false);
      toast.success(form.isImportant ? 'Important notice posted & residents emailed!' : 'Notice posted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setPosting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      setNotices(prev => prev.filter(n => n._id !== id));
      toast.success('Notice deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notice Board</h1>
          <p className="text-muted text-sm mt-2">Post and manage society announcements</p>
        </div>
        <button id="new-notice-btn" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <FiPlus /> {showForm ? 'Cancel' : 'Post Notice'}
        </button>
      </div>

      {/* Post form */}
      {showForm && (
        <div className="card mb-6" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
          <h3 className="mb-4">New Notice</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="n-title">Title *</label>
              <input id="n-title" name="title" placeholder="Notice title…" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="n-content">Content *</label>
              <textarea id="n-content" name="content" rows={5} placeholder="Write your notice here…" value={form.content} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input id="n-important" name="isImportant" type="checkbox" checked={form.isImportant} onChange={handleChange}
                style={{ width: 'auto', cursor: 'pointer' }} />
              <label htmlFor="n-important" style={{ margin: 0, cursor: 'pointer', color: form.isImportant ? '#f87171' : 'var(--text-muted)' }}>
                ⚠ Mark as Important — will email all residents
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button id="post-notice-btn" type="submit" className="btn btn-primary" disabled={posting}>
                {posting ? 'Posting…' : '📢 Post Notice'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Notices list */}
      {loading ? <div className="spinner" /> : notices.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
          <p className="text-muted">No notices yet. Post the first one!</p>
        </div>
      ) : (
        notices.map(n => (
          <div key={n._id} className={`notice-card ${n.isImportant ? 'important' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {n.isImportant && <span className="badge badge-important">⚠ Important</span>}
                <span className="text-subtle text-xs">
                  {format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a')}
                </span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(n._id)} style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
                <FiTrash2 />
              </button>
            </div>
            <h3 style={{ marginBottom: 8 }}>{n.title}</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{n.content}</p>
          </div>
        ))
      )}
    </div>
  );
}
