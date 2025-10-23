import './PatientDashboard.css';
import { useNavigate } from 'react-router-dom';

export default function PatientLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Patient Menu</h3>
        <ul>
          <li onClick={() => navigate('/patient-dashboard')}>Dashboard</li>
          <li onClick={() => navigate('/patient-appointments')}>My Appointments</li>
          <li onClick={() => navigate('/patient-book')}>Book Appointment</li>
          <li onClick={() => navigate('/patient-profile')}>Profile</li>
        </ul>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="main-content">
        <div className="navbar">
          <strong>Welcome, Patient</strong>
        </div>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}