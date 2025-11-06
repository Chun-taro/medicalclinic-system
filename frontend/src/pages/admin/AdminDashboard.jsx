import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Style/admindashboard1.css';

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalUsers: 0,
    todayAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [appointmentsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/appointments', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const today = new Date().toDateString();
        const todayAppointments = appointmentsRes.data.filter(
          (apt) => new Date(apt.appointmentDate).toDateString() === today
        ).length;

        setStats({
          totalAppointments: appointmentsRes.data.length,
          totalUsers: usersRes.data.length,
          todayAppointments,
        });

        setAppointments(appointmentsRes.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const appointmentsForDate = appointments.filter(
    (app) =>
      new Date(app.appointmentDate).toDateString() ===
      selectedDate.toDateString()
  );

  const highlightDates = ({ date, view }) => {
    if (view === 'month') {
      const hasAppointment = appointments.some(
        (app) =>
          new Date(app.appointmentDate).toDateString() === date.toDateString()
      );
      return hasAppointment ? 'has-appointment' : null;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="loading-text">Loading dashboard...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-container">
        {/* Left Section: Stats */}
        <div className="dashboard-left">
          <h2 className="dashboard-heading">📊 Dashboard Overview</h2>

          <div className="stats-grid">
            <div className="stat-card blue">
              <h3>Total Appointments</h3>
              <p>{stats.totalAppointments}</p>
            </div>

            <div className="stat-card green">
              <h3>Total Users</h3>
              <p>{stats.totalUsers}</p>
            </div>

            <div className="stat-card yellow">
              <h3>Today's Appointments</h3>
              <p>{stats.todayAppointments}</p>
            </div>
          </div>
        </div>

        {/* Right Section: Calendar & Appointments */}
        <div className="dashboard-right">
          <div className="calendar-card">
            <h2 className="dashboard-heading">📅 Calendar</h2>
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              className="styled-calendar"
              tileClassName={highlightDates}
            />
          </div>

          <div className="appointment-section">
            <h3 className="appointment-title">
              Appointments for {selectedDate.toDateString()}
            </h3>
            <ul className="appointment-list">
              {appointmentsForDate.length === 0 ? (
                <li className="no-appointments">No appointments</li>
              ) : (
                appointmentsForDate.map((app) => {
                  const isPast = new Date(app.appointmentDate) < new Date();

                  return (
                    <li
                      key={app._id}
                      className={`appointment-item ${
                        isPast ? 'past-appointment' : ''
                      }`}
                    >
                      <div className="appointment-info">
                        <strong>
                          {app.firstName} {app.lastName}
                        </strong>
                        <span className="appointment-time">
                          {new Date(app.appointmentDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="appointment-note">
                        Purpose: {app.purpose || 'N/A'}
                      </p>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}