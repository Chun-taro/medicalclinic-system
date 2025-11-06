import React, { useState, useRef, useEffect } from 'react';
import './Style/PatientDashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, CalendarPlus, Bell } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export default function PatientLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { patient, setPatient } = usePatient();

  const [unreadCount, setUnreadCount] = useState(0);

  const user = {
    firstName: patient?.firstName || 'Patient',
    middleName: patient?.middleName || '',
    lastName: patient?.lastName || '',
    profileImage: patient?.avatar || '',
  };

  const handleLogout = () => {
    localStorage.clear();
    setPatient(null);
    navigate('/', { replace: true });
  };

  // fetch unread notifications
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications/unread', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getInitials = (first, last) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h3 className="sidebar-title">Patient Menu</h3>
          <ul className="sidebar-menu">
            <li className={location.pathname === '/patient-dashboard' ? 'active' : ''} onClick={() => navigate('/patient-dashboard')}>
              <LayoutDashboard className="menu-icon" />
              <span>Dashboard</span>
            </li>
            <li className={location.pathname === '/patient-appointments' ? 'active' : ''} onClick={() => navigate('/patient-appointments')}>
              <CalendarDays className="menu-icon" />
              <span>My Appointments</span>
            </li>
            <li className={location.pathname === '/patient-book' ? 'active' : ''} onClick={() => navigate('/patient-book')}>
              <CalendarPlus className="menu-icon" />
              <span>Book Appointment</span>
            </li>
          </ul>
        </div>
      </aside>

      <main className="main-content">
        <nav className="navbar">
          <div className="navbar-left">
            <h1 className="fb-name">{user.firstName} {user.middleName} {user.lastName}</h1>
          </div>

          <div className="navbar-right">
            <div className="notification-wrapper" onClick={() => navigate('/patient-notifications')}>
              <Bell className="notification-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>

            <div className="profile-menu" ref={dropdownRef}>
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="profile-icon" onClick={() => setDropdownOpen(!dropdownOpen)} />
              ) : (
                <div className="profile-initials" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {getInitials(user.firstName, user.lastName)}
                </div>
              )}

              {dropdownOpen && (
                <div className="dropdown">
                  <button onClick={() => navigate('/patient-profile')}>View Profile</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}