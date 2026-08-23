import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Layout from './components/Layout';

// Resident pages
import ResidentDashboard from './pages/resident/ResidentDashboard';
import RaiseComplaint from './pages/resident/RaiseComplaint';
import MyComplaints from './pages/resident/MyComplaints';
import ComplaintDetail from './pages/resident/ComplaintDetail';
import NoticeBoardResident from './pages/resident/NoticeBoardResident';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminComplaintDetail from './pages/admin/AdminComplaintDetail';
import AdminNoticeBoard from './pages/admin/AdminNoticeBoard';

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/resident'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/resident'} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/resident'} replace /> : <RegisterPage />} />

      {/* Resident routes */}
      <Route path="/resident" element={<ProtectedRoute requiredRole="resident"><Layout /></ProtectedRoute>}>
        <Route index element={<ResidentDashboard />} />
        <Route path="raise" element={<RaiseComplaint />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="notices" element={<NoticeBoardResident />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="complaints/:id" element={<AdminComplaintDetail />} />
        <Route path="notices" element={<AdminNoticeBoard />} />
      </Route>

      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/resident') : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
