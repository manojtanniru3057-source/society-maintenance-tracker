import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { FiUpload, FiX } from 'react-icons/fi';

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Elevator', 'Parking', 'Garden', 'Other'];

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: '', description: '' });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB'); return; }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => { setPhoto(null); setPreview(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { toast.error('Please select a category'); return; }
    setLoading(true);

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('category', form.category);
    fd.append('description', form.description);
    if (photo) fd.append('photo', photo);

    try {
      await api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Complaint raised successfully!');
      navigate('/resident/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Raise a Complaint</h1>
          <p className="text-muted text-sm mt-2">Describe your issue and our team will address it promptly</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="c-title">Complaint title *</label>
            <input id="c-title" name="title" placeholder="Brief description of the issue" value={form.title} onChange={handleChange} required maxLength={120} />
          </div>

          <div className="form-group">
            <label htmlFor="c-category">Category *</label>
            <select id="c-category" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="c-desc">Description *</label>
            <textarea
              id="c-desc" name="description"
              rows={5}
              placeholder="Provide as much detail as possible — location, severity, when it started, etc."
              value={form.description} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label>Photo (optional, max 5 MB)</label>
            {preview ? (
              <div style={{ position: 'relative', width: 'fit-content' }}>
                <img src={preview} alt="Preview" style={{ maxWidth: 280, maxHeight: 200, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                <button type="button" onClick={removePhoto}
                  style={{ position: 'absolute', top: -8, right: -8, background: 'var(--danger)', border: 'none', borderRadius: '50%', width: 24, height: 24, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiX size={12} />
                </button>
              </div>
            ) : (
              <label htmlFor="c-photo" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '32px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', gap: 8, color: 'var(--text-muted)', transition: 'border-color 0.2s'
              }}>
                <FiUpload size={24} />
                <span className="text-sm">Click to upload a photo</span>
                <span className="text-xs text-subtle">JPG, PNG, WEBP – max 5 MB</span>
                <input id="c-photo" type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button id="submit-complaint-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting…' : '🚀 Submit Complaint'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
