import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientLayout from './PatientLayout';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const googleId = localStorage.getItem('googleId');

      if (!userId || !token) {
        setError('Missing user credentials. Please log in again.');
        setLoading(false);
        return;
      }

      // 🔍 Double-check role using Google ID if available
      if (googleId) {
        try {
          const res = await axios.get(`http://localhost:5000/api/users/role-by-google/${googleId}`);
          const fetchedRole = res.data.role;
          if (fetchedRole !== 'patient') {
            navigate('/unauthorized');
            return;
          }
        } catch (err) {
          console.error('Error validating role via Google ID:', err.response?.data || err.message);
          navigate('/unauthorized');
          return;
        }
      } else if (role !== 'patient') {
        navigate('/unauthorized');
        return;
      }

      // ✅ Fetch appointments
      try {
        const res = await axios.get(`http://localhost:5000/api/appointments/patient/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(res.data);
      } catch (err) {
        console.error('Error fetching appointments:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <PatientLayout>
      <h2>Dashboard</h2>
      <p>Welcome to your patient dashboard. Below are your appointments:</p>

      {loading ? (
        <p>Loading appointments...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="table-container">
          <table className="appointment-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Date</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Diagnosis</th>
                <th>Management</th>
                <th>Medicines</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt._id}>
                  <td>{apt.status}</td>
                  <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                  <td>{apt.typeOfVisit || '—'}</td>
                  <td>{apt.reasonForVisit || '—'}</td>
                  <td>{apt.diagnosis || '—'}</td>
                  <td>{apt.management || '—'}</td>
                  <td>
                    {Array.isArray(apt.medicinesPrescribed)
                      ? apt.medicinesPrescribed.map((med, idx) => (
                          <span key={med._id || idx}>
                            {med.name} ({med.quantity})
                            {idx < apt.medicinesPrescribed.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      : apt.medicinesPrescribed || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PatientLayout>
  );
}