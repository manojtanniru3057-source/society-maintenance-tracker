import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../../components/Badges';
import { format } from 'date-fns';
import { FiEye, FiFilter } from 'react-icons/fi';

const CATEGORIES = ['', 'Plumbing', 'Electrical', 'Cleaning', 'Security', 'Elevator', 'Parking', 'Garden', 'Other'];
const STATUSES = ['', 'Open', 'In Progress', 'Resolved'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchComplaints = async (f = filters, p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 15 });
    if (f.category) params.set('category', f.category);
    if (f.status) params.set('status', f.status);
    if (f.from) params.set('from', f.from);
    if (f.to) params.set('to', f.to);
    try {
      const r = await api.get(`/complaints?${params}`);
      setComplaints(r.data.complaints);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleFilterChange = (e) => setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleApplyFilters = () => { setPage(1); fetchComplaints(filters, 1); };
  const handleReset = () => {
    const reset = { category: '', status: '', from: '', to: '' };
    setFilters(reset); setPage(1); fetchComplaints(reset, 1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>All Complaints</h1>
          <p className="text-muted text-sm mt-2">{total} complaint{total !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>From date</label>
          <input type="date" name="from" value={filters.from} onChange={handleFilterChange} />
        </div>
        <div className="form-group">
          <label>To date</label>
          <input type="date" name="to" value={filters.to} onChange={handleFilterChange} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
          <button id="apply-filters-btn" className="btn btn-primary" onClick={handleApplyFilters}><FiFilter /> Apply</button>
          <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
        </div>
      </div>

      {loading ? <div className="spinner" /> : complaints.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 0' }}>
          <p className="text-muted">No complaints match your filters.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th><th>Resident</th><th>Category</th><th>Status</th><th>Priority</th><th>Date</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id} className={c.isOverdue ? 'overdue' : ''}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.title}</div>
                      {c.isOverdue && <OverdueBadge />}
                    </td>
                    <td>
                      <div className="text-sm">{c.resident?.name}</div>
                      <div className="text-xs text-subtle">{c.resident?.flatNumber}</div>
                    </td>
                    <td className="text-muted text-sm">{c.category}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td className="text-subtle text-xs">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                    <td>
                      <Link to={`/admin/complaints/${c._id}`} className="btn btn-secondary btn-sm">
                        <FiEye /> Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => { setPage(p => p - 1); fetchComplaints(filters, page - 1); }}>
                ← Prev
              </button>
              <span className="text-muted text-sm">Page {page} of {pages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => { setPage(p => p + 1); fetchComplaints(filters, page + 1); }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
