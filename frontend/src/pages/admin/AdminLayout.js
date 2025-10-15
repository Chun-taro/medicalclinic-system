import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Admin Menu</h3>
        <ul>
          <li onClick={() => navigate('/admin-dashboard')}>Dashboard</li>
          <li onClick={() => navigate('/admin-appointments')}>All Appointments</li>
          <li onClick={() => navigate('/admin-users')}>Manage Users</li>
          <li onClick={() => navigate('/admin-reports')}>Reports</li>
          <li onClick={() => navigate('/admin-consultation/preview')}>Consultation</li> {/* ✅ NEW */}
          <li onClick={() => navigate('/admin-inventory')}>Inventory</li>
          </ul>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="main-content">
        <div className="navbar">
          <strong>Welcome, Admin</strong>
        </div>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}