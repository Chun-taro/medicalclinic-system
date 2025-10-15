import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './appointment-table.css';

export default function AllAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(prev => prev.filter(app => app._id !== id));
    } catch (err) {
      alert('Failed to delete appointment');
      console.error(err);
    }
  };

  const handleApprove = async id => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/appointments/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Appointment approved');
      fetchAppointments(); // ✅ Refresh list after approval
    } catch (err) {
      alert('Failed to approve appointment');
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <h2>All Appointments</h2>
      {loading ? (
        <p>Loading appointments...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <>
          <h3>Pending Appointments</h3>
          <div className="appointment-grid">
            {appointments.filter(app => app.status === 'pending').map(app => (
              <div key={app._id} className="appointment-card">
                <div className="card-top">
                  <span>{app.firstName} {app.lastName}</span>
                  <span>{new Date(app.appointmentDate).toLocaleDateString()}</span>
                </div>
                <div className="card-info">
                  <p><strong>Email:</strong> {app.email}</p>
                  <p><strong>Phone:</strong> {app.phone}</p>
                  <p><strong>Purpose:</strong> {app.purpose}</p>
                  <p><strong>Status:</strong> {app.status}</p>
                </div>
                <div className="card-actions">
                  <button onClick={() => handleApprove(app._id)}>✅</button>
                  <button onClick={() => alert(`Edit form for ${app.firstName}`)}>✏️</button>
                  <button onClick={() => handleDelete(app._id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>

          <h3>Approved Appointments</h3>
          <div className="appointment-grid">
            {appointments.filter(app => app.status === 'approved').map(app => (
              <div key={app._id} className="appointment-card">
                <div className="card-top">
                  <span>{app.firstName} {app.lastName}</span>
                  <span>{new Date(app.appointmentDate).toLocaleDateString()}</span>
                </div>
                <div className="card-info">
                  <p><strong>Email:</strong> {app.email}</p>
                  <p><strong>Phone:</strong> {app.phone}</p>
                  <p><strong>Purpose:</strong> {app.purpose}</p>
                  <p><strong>Status:</strong> {app.status}</p>
                </div>
                <div className="card-actions">
                  <button onClick={() => alert(`Edit form for ${app.firstName}`)}>✏️</button>
                  <button onClick={() => handleDelete(app._id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}