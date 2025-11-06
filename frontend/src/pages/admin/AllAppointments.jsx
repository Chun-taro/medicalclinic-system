import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Style/appointment-table.css';

export default function AllAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editPurpose, setEditPurpose] = useState('');

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
      fetchAppointments();
    } catch (err) {
      alert('Failed to approve appointment');
      console.error(err);
    }
  };

  const openEditModal = appointment => {
    setEditId(appointment._id);
    setEditDate(appointment.appointmentDate.split('T')[0]);
    setEditPurpose(appointment.purpose);
    setShowModal(true);
  };

  const handleReschedule = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/appointments/${editId}`, {
        appointmentDate: editDate,
        purpose: editPurpose
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Appointment rescheduled and patient notified');
      setShowModal(false);
      fetchAppointments();
    } catch (err) {
      alert('Failed to reschedule appointment');
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <h2>All Appointments</h2>

      {/* Tab Navigation */}
      <div className="tab-header">
        <button
          className={activeTab === 'pending' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('pending')}
        >
          📝 Pending
        </button>
        <button
          className={activeTab === 'approved' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('approved')}
        >
          ✅ Approved
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reschedule Appointment</h3>
            <label>Date:</label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <label>Purpose:</label>
            <input
              type="text"
              value={editPurpose}
              onChange={(e) => setEditPurpose(e.target.value)}
            />
            <div style={{ marginTop: '10px' }}>
              <button onClick={handleReschedule}>Confirm</button>
              <button onClick={() => setShowModal(false)} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Tables */}
      {loading ? (
        <p>Loading appointments...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <>
          {activeTab === 'pending' && (
            <>
              <h3>Pending Appointments</h3>
              <div className="appointment-table-wrapper">
                <table className="appointment-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Purpose</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
  {appointments.filter(app => app.status === 'pending').map(app => (
    <tr key={app._id}>
      <td>{app.patientId?.firstName} {app.patientId?.lastName}</td>
      <td>{new Date(app.appointmentDate).toLocaleDateString()}</td>
      <td>{app.patientId?.email}</td>
      <td>{app.patientId?.contactNumber}</td>
      <td>{app.purpose}</td>
      <td><span className="status-tag pending">Pending</span></td>
      <td className="action-cell">
        <button onClick={() => handleApprove(app._id)}>✅</button>
        <button onClick={() => openEditModal(app)}>✏️</button>
        <button onClick={() => handleDelete(app._id)}>🗑️</button>
      </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'approved' && (
            <>
              <h3>Approved Appointments</h3>
              <div className="appointment-table-wrapper">
                <table className="appointment-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Purpose</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
  {appointments.filter(app => app.status === 'approved').map(app => (
    <tr key={app._id}>
      <td>{app.patientId?.firstName} {app.patientId?.lastName}</td>
      <td>{new Date(app.appointmentDate).toLocaleDateString()}</td>
      <td>{app.patientId?.email}</td>
      <td>{app.patientId?.contactNumber}</td>
      <td>{app.purpose}</td>
      <td><span className="status-tag confirmed">Approved</span></td>
      <td className="action-cell">
        <button onClick={() => openEditModal(app)}>✏️</button>
        <button onClick={() => handleDelete(app._id)}>🗑️</button>
      </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </AdminLayout>
  );
}