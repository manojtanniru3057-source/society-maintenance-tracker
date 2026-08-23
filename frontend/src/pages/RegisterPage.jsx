import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiHash } from 'react-icons/fi';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', flatNumber: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.name}!`);
      navigate('/resident');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const iconStyle = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' };
  const inputStyle = { paddingLeft: 36 };

  return (
    <div className="auth-page">
      <div className="card card-glass auth-card">
        <div className="auth-header">
          <div className="icon">✨</div>
          <h1>Create account</h1>
          <p>Join Society Maintenance Tracker as a resident</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={iconStyle} />
                <input id="name" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} style={inputStyle} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="flatNumber">Flat number</label>
              <div style={{ position: 'relative' }}>
                <FiHash style={iconStyle} />
                <input id="flatNumber" name="flatNumber" placeholder="A-204" value={form.flatNumber} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={iconStyle} />
              <input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password <span className="text-subtle text-xs">(min 6 chars)</span></label>
            <div style={{ position: 'relative' }}>
              <FiLock style={iconStyle} />
              <input id="password" name="password" type="password" placeholder="Create a password" value={form.password} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>

          <button id="register-btn" type="submit" className="btn btn-primary w-full mt-4" style={{ justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
