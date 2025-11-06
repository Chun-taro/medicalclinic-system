import React, { useState, useRef, useEffect } from 'react';
import './Style/AdminDashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  Package,
  Stethoscope,
  Bell,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const admin = {
    firstName: (localStorage.getItem('firstName') || 'Admin').trim(),
    lastName: (localStorage.getItem('lastName') || '').trim(),
    profileImage: (localStorage.getItem('profileImage') || '').trim(),
  };

  const handleLogout = () => {
    ['token', 'userId', 'firstName', 'lastName', 'profileImage'].forEach((k) =>
      localStorage.removeItem(k)
    );
    navigate('/', { replace: true });
  };

  // fetch unread notifications
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications/unread', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUnreadCount(data.unreadCount); // 👈 same as patient
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
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

    const socket = io('http://localhost:5000');
    socket.on('newAppointment', (data) => {
      toast.info(data.message);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      document.removeEventListener('click', handleClickOutside);
      socket.disconnect();
    };
  }, []);

  const getInitials = (first, last) =>
    `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

  const menuItems = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'All Appointments', path: '/admin-appointments', icon: <CalendarDays size={18} /> },
    { name: 'Manage Users', path: '/admin-users', icon: <Users size={18} /> },
    { name: 'Reports', path: '/admin-reports', icon: <BarChart3 size={18} /> },
    { name: 'Consultation', path: '/admin-consultation/preview', icon: <Stethoscope size={18} /> },
    { name: 'Inventory', path: '/admin-inventory', icon: <Package size={18} /> },
  ];

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h3 className="sidebar-title">Admin Menu</h3>
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="main-content">
        <nav className="navbar">
          <div className="navbar-left">
            <h1 className="fb-name">{admin.firstName} {admin.lastName}</h1>
          </div>

          <div className="navbar-right">
            {/* 🔔 Notification Bell copied from PatientLayout */}
            <div className="notification-wrapper" onClick={() => navigate('/admin-notifications')}>
              <Bell className="notification-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="profile-menu" ref={dropdownRef}>
              {admin.profileImage ? (
                <img
                  src={admin.profileImage}
                  alt="Profile"
                  className="profile-icon"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />
              ) : (
                <div
                  className="profile-initials"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {getInitials(admin.firstName, admin.lastName)}
                </div>
              )}

              {dropdownOpen && (
                <div className="dropdown">
                  <button onClick={() => navigate('/admin-profile')}>View Profile</button>
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