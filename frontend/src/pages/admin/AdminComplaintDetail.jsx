import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../../components/Badges';
import HistoryTimeline from '../../components/HistoryTimeline';
import { format } from 'date-fns';
import { FiArrowLeft } from 'react-icons/fi';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Open', 'In Progress', 'Resolved'];

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaint = () => {
    api.get(`/complaints/${id}`)
      .then(r => { setComplaint(r.data); setNewStatus(r.data.status); setNewPriority(r.data.priority); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchComplaint(); }, [id]);

  const handlePriority = async () => {
    setSubmitting(true);
    try {
      const r = await api.patch(`/complaints/${id}/priority`, { priority: newPriority });
      setComplaint(r.data);
      toast.success('Priority updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleStatus = async () => {
    setSubmitting(true);
    try {
      const r = await api.patch(`/complaints/${id}/status`, { status: newStatus, note });
      setComplaint(r.data);
      setNote('');
      toast.success('Status updated and resident notified');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="spinner" />;
  if (!complaint) return <div className="card text-center" style={{ padding: 40 }}><p className="text-muted">Complaint not found.</p></div>;

  const isResolved = complaint.status === 'Resolved';

  return (
    <div>
      <button className="btn btn-secondary btn-sm mb-4" onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left: details + controls */}
        <div>
          <div className="card mb-4">
            <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              {complaint.isOverdue && <OverdueBadge />}
            </div>
            <h2 className="mt-2">{complaint.title}</h2>
            <p className="text-subtle text-sm mt-2">
              {complaint.category} · {format(new Date(complaint.createdAt), 'MMM d, yyyy h:mm a')}
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div className="text-xs text-subtle">Resident</div>
                <div className="text-sm font-bold" style={{ marginTop: 4 }}>{complaint.resident?.name}</div>
                <div className="text-xs text-muted">{complaint.resident?.email}</div>
                {complaint.resident?.flatNumber && <div className="text-xs text-subtle">Flat: {complaint.resident.flatNumber}</div>}
              </div>
            </div>
            <p style={{ lineHeight: 1.7 }}>{complaint.description}</p>
          </div>

          {complaint.photoUrl && (
            <div className="card mb-4">
              <h4 className="mb-3">Attached Photo</h4>
              <a href={complaint.photoUrl} target="_blank" rel="noopener noreferrer">
                <img src={complaint.photoUrl} alt="Complaint" style={{ width: '100%', borderRadius: 8, maxHeight: 280, objectFit: 'cover' }} />
              </a>
            </div>
          )}

          {/* Admin controls */}
          {!isResolved && (
            <div className="card">
              <h3 className="mb-4">Update Complaint</h3>

              <div className="form-group">
                <label htmlFor="priority-select">Priority</label>
                <select id="priority-select" value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button id="update-priority-btn" className="btn btn-secondary btn-sm mb-4" onClick={handlePriority} disabled={submitting || newPriority === complaint.priority}>
                Set Priority
              </button>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

              <div className="form-group">
                <label htmlFor="status-select">New Status</label>
                <select id="status-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status-note">Note (optional)</label>
                <textarea id="status-note" rows={3} placeholder="Add a note for the resident…" value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <button id="update-status-btn" className="btn btn-primary" onClick={handleStatus} disabled={submitting || newStatus === complaint.status}>
                {submitting ? 'Updating…' : 'Update Status & Notify Resident'}
              </button>
            </div>
          )}
          {isResolved && (
            <div className="card" style={{ textAlign: 'center', padding: '28px', borderColor: 'rgba(16,185,129,0.4)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
              <h4 style={{ color: '#34d399' }}>Complaint Resolved</h4>
              <p className="text-muted text-sm mt-2">This complaint has been closed.</p>
            </div>
          )}
        </div>

        {/* Right: history */}
        <div className="card">
          <h3 className="mb-4">Status History</h3>
          <HistoryTimeline history={complaint.history || []} />
        </div>
      </div>
    </div>
  );
}
