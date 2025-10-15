import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './consultation.css';

export default function ConsultationPage() {
  const [approvedAppointments, setApprovedAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form, setForm] = useState({
    bloodPressure: '',
    temperature: '',
    oxygenSaturation: '',
    heartRate: '',
    bmi: '',
    bmiIntervention: '',
    diagnosis: '',
    management: '',
    medicinesPrescribed: '',
    referredToPhysician: false,
    physicianName: '',
    firstAidDone: 'n',
    firstAidWithin30Mins: 'n/a'
  });

  // ✅ Fetch approved appointments
  const fetchApprovedAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const approved = res.data.filter(app => app.status === 'approved');
      setApprovedAppointments(approved);
    } catch (err) {
      console.error('Error fetching appointments:', err.message);
    }
  };

  useEffect(() => {
    fetchApprovedAppointments();
  }, []);

  const handleStartConsultation = appointment => {
    setSelectedAppointment(appointment);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ✅ Save consultation and refresh queue
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/appointments/${selectedAppointment._id}/consultation`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Consultation saved');
      setSelectedAppointment(null);
      fetchApprovedAppointments(); // ✅ refresh queue
    } catch (err) {
      console.error('Error saving consultation:', err.message);
      alert('Failed to save consultation');
    }
  };

  return (
    <AdminLayout>
      <div className="consultation-container">
        <h2>Consultation Queue</h2>
        {approvedAppointments.length === 0 ? (
          <p>No approved appointments waiting for consultation.</p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Email</th>
                <th>Date</th>
                <th>Purpose</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedAppointments.map(app => (
                <tr key={app._id}>
                  <td>{app.firstName} {app.lastName}</td>
                  <td>{app.email}</td>
                  <td>{new Date(app.appointmentDate).toLocaleDateString()}</td>
                  <td>{app.purpose}</td>
                  <td>
                    <button onClick={() => handleStartConsultation(app)}>🩺 Start</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedAppointment && (
          <>
            <h3>Consultation for {selectedAppointment.firstName} {selectedAppointment.lastName}</h3>
            <p>Appointment Date: {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>

            <form onSubmit={handleSubmit} className="consultation-form">
              <input name="bloodPressure" placeholder="Blood Pressure" value={form.bloodPressure} onChange={handleChange} />
              <input name="temperature" placeholder="Temperature" value={form.temperature} onChange={handleChange} />
              <input name="oxygenSaturation" placeholder="Oxygen Saturation" value={form.oxygenSaturation} onChange={handleChange} />
              <input name="heartRate" placeholder="Heart Rate" value={form.heartRate} onChange={handleChange} />
              <input name="bmi" placeholder="BMI" value={form.bmi} onChange={handleChange} />
              <input name="bmiIntervention" placeholder="BMI Intervention" value={form.bmiIntervention} onChange={handleChange} />
              <textarea name="diagnosis" placeholder="Diagnosis" value={form.diagnosis} onChange={handleChange} rows={3} />
              <textarea name="management" placeholder="Management Plan" value={form.management} onChange={handleChange} rows={3} />
              <textarea name="medicinesPrescribed" placeholder="Prescribed Medicines" value={form.medicinesPrescribed} onChange={handleChange} rows={2} />
              <label>
                <input type="checkbox" name="referredToPhysician" checked={form.referredToPhysician} onChange={handleChange} />
                Referred to Physician
              </label>
              <input name="physicianName" placeholder="Physician Name" value={form.physicianName} onChange={handleChange} />
              <select name="firstAidDone" value={form.firstAidDone} onChange={handleChange}>
                <option value="y">Yes</option>
                <option value="n">No</option>
              </select>
              <select name="firstAidWithin30Mins" value={form.firstAidWithin30Mins} onChange={handleChange}>
                <option value="y">Yes</option>
                <option value="n">No</option>
                <option value="n/a">N/A</option>
              </select>

              <button type="submit">Save Consultation</button>
            </form>
          </>
        )}
      </div>
    </AdminLayout>
  );
}