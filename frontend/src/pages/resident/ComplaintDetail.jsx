import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../../components/Badges';
import HistoryTimeline from '../../components/HistoryTimeline';
import { format } from 'date-fns';
import { FiArrowLeft } from 'react-icons/fi';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/complaints/${id}`).then(r => { setComplaint(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!complaint) return <div className="card text-center" style={{ padding: 40 }}><p className="text-muted">Complaint not found.</p></div>;

  return (
    <div>
      <button className="btn btn-secondary btn-sm mb-4" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Main details */}
        <div>
          <div className="card mb-4">
            <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              {complaint.isOverdue && <OverdueBadge />}
            </div>
            <h2 className="mt-2">{complaint.title}</h2>
            <p className="text-subtle text-sm mt-2">
              {complaint.category} · Raised {format(new Date(complaint.createdAt), 'MMMM d, yyyy h:mm a')}
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <p style={{ lineHeight: 1.7 }}>{complaint.description}</p>
          </div>

          {complaint.photoUrl && (
            <div className="card">
              <h4 className="mb-3">Attached Photo</h4>
              <img src={complaint.photoUrl} alt="Complaint photo" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 300 }} />
            </div>
          )}
        </div>

        {/* Status history */}
        <div className="card">
          <h3 className="mb-4">Status History</h3>
          <HistoryTimeline history={complaint.history || []} />
        </div>
      </div>
    </div>
  );
}
