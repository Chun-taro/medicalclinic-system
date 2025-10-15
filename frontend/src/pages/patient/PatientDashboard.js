import { useState, useEffect } from 'react';
import axios from 'axios';
import PatientLayout from './PatientLayout';


export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        setError('Missing user credentials. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/appointments/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAppointments(res.data);
      } catch (err) {
        console.error('Error fetching appointments:', err.response?.data || err.message);
        setError('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Date</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Complaint</th>
              <th>Diagnosis</th>
              <th>Management</th>
              <th>BP</th>
              <th>Temp</th>
              <th>O₂</th>
              <th>HR</th>
              <th>BMI</th>
              <th>BMI Advice</th>
              <th>Campus</th>
              <th>Course & Year</th>
              <th>COVID Vax</th>
              <th>Allergies</th>
              <th>Medications</th>
              <th>Available</th>
              <th>Qty</th>
              <th>Referred</th>
              <th>Physician</th>
              <th>External Faculty</th>
              <th>Time Referred</th>
              <th>Within 1hr</th>
              <th>First Aid</th>
              <th>Within 30min</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt._id}>
                <td>{apt.status}</td>
                <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                <td>{apt.typeOfVisit}</td>
                <td>{apt.reasonForVisit}</td>
                <td>{apt.chiefComplaint}</td>
                <td>{apt.diagnosis}</td>
                <td>{apt.management}</td>
                <td>{apt.bloodPressure}</td>
                <td>{apt.temperature}</td>
                <td>{apt.oxygenSaturation}</td>
                <td>{apt.heartRate}</td>
                <td>{apt.bmi}</td>
                <td>{apt.bmiIntervention}</td>
                <td>{apt.campus}</td>
                <td>{apt.courseAndYear}</td>
                <td>{apt.covidVaccinationStatus}</td>
                <td>{apt.allergies}</td>
                <td>{apt.medicinesPrescribed}</td>
                <td>{apt.availableInClinic ? 'Yes' : 'No'}</td>
                <td>{apt.quantity}</td>
                <td>{apt.referredToPhysician ? 'Yes' : 'No'}</td>
                <td>{apt.physicianName || '-'}</td>
                <td>{apt.referredToExternalFaculty ? 'Yes' : 'No'}</td>
                <td>{apt.timeReferred || '-'}</td>
                <td>{apt.referredWithin1Hour}</td>
                <td>{apt.firstAidDone}</td>
                <td>{apt.firstAidWithin30Mins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PatientLayout>
  );
}