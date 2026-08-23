import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiPlusCircle, FiList, FiBell, FiBarChart2,
  FiLogOut, FiUsers
} from 'react-icons/fi';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const residentLinks = [
    { to: '/resident', icon: <FiHome />, label: 'Dashboard', end: true },
    { to: '/resident/raise', icon: <FiPlusCircle />, label: 'Raise Complaint' },
    { to: '/resident/complaints', icon: <FiList />, label: 'My Complaints' },
    { to: '/resident/notices', icon: <FiBell />, label: 'Notice Board' },
  ];

  const adminLinks = [
    { to: '/admin', icon: <FiBarChart2 />, label: 'Dashboard', end: true },
    { to: '/admin/complaints', icon: <FiList />, label: 'All Complaints' },
    { to: '/admin/notices', icon: <FiBell />, label: 'Notice Board' },
  ];

  const links = user?.role === 'admin' ? adminLinks : residentLinks;
  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="page-wrapper">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>🏢 Society Tracker</h2>
          <p>{user?.role === 'admin' ? 'Admin Panel' : 'Resident Portal'}</p>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="name">{user?.name}</div>
              <div className="role">{user?.role}{user?.flatNumber ? ` · ${user.flatNumber}` : ''}</div>
            </div>
          </div>
          <button
            className="btn btn-secondary w-full mt-2"
            style={{ justifyContent: 'center' }}
            onClick={handleLogout}
          >
            <FiLogOut /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
