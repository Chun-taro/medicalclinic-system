import { useEffect, useState } from 'react';
import axios from 'axios';
import PatientLayout from './PatientLayout';
import './consultations.css'; // Optional: reuse styles

export default function MyConsultations() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const res = await axios.get(`http://localhost:5000/api/appointments/patient/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const completed = res.data.filter(app => app.status === 'completed');
        setAppointments(completed);
      } catch (err) {
        console.error('Error fetching consultations:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  return (
    <PatientLayout>
      <div className="consultation-container">
        <h2>My Consultations</h2>
        <p>View details of your completed medical consultations.</p>

        {loading ? (
          <p>Loading...</p>
        ) : appointments.length === 0 ? (
          <p>No completed consultations found.</p>
        ) : (
          <div className="consultation-list">
            {appointments.map(app => (
              <div key={app._id} className="consultation-card">
                <h4>{new Date(app.appointmentDate).toLocaleDateString()}</h4>
                <p><strong>Diagnosis:</strong> {app.diagnosis || '—'}</p>
                <p><strong>Management:</strong> {app.management || '—'}</p>
                <p><strong>Prescribed Medicines:</strong> {app.medicinesPrescribed || '—'}</p>
                <p><strong>Vitals:</strong> BP: {app.bloodPressure || '—'}, Temp: {app.temperature || '—'}, O₂: {app.oxygenSaturation || '—'}, HR: {app.heartRate || '—'}, BMI: {app.bmi || '—'}</p>
                <p><strong>BMI Intervention:</strong> {app.bmiIntervention || '—'}</p>
                <p><strong>Referred to Physician:</strong> {app.referredToPhysician ? `Yes (${app.physicianName || '—'})` : 'No'}</p>
                <p><strong>First Aid:</strong> {app.firstAidDone === 'y' ? 'Yes' : 'No'} ({app.firstAidWithin30Mins})</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}