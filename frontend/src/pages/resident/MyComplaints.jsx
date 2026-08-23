import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../../components/Badges';
import { format } from 'date-fns';
import { FiEye } from 'react-icons/fi';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/my').then(r => { setComplaints(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Complaints</h1>
          <p className="text-muted text-sm mt-2">{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/resident/raise" className="btn btn-primary">+ Raise New</Link>
      </div>

      {loading ? <div className="spinner" /> : complaints.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>📭</div>
          <h3 className="mb-4">No complaints yet</h3>
          <Link to="/resident/raise" className="btn btn-primary">Raise your first complaint</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Status</th><th>Priority</th><th>Raised on</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c._id} className={c.isOverdue ? 'overdue' : ''}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.title}</div>
                    {c.isOverdue && <OverdueBadge />}
                  </td>
                  <td className="text-muted">{c.category}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td className="text-subtle text-sm">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                  <td>
                    <Link to={`/resident/complaints/${c._id}`} className="btn btn-secondary btn-sm">
                      <FiEye /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
