import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './consultation.css';

export default function ConsultationPage() {
  const [approvedAppointments, setApprovedAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [prescribedList, setPrescribedList] = useState([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

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

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/medicines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicineOptions(res.data);
    } catch (err) {
      console.error('Error fetching medicines:', err.message);
    }
  };

  useEffect(() => {
    fetchApprovedAppointments();
    fetchMedicines();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleStartConsultation = appointment => {
    setSelectedAppointment(appointment);
    setPrescribedList([]);
    setShowModal(true);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuantityChange = (medicineId, qty) => {
    setPrescribedList(prev =>
      prev.map(p =>
        p.medicineId === medicineId
          ? { ...p, quantity: parseInt(qty) || 1 }
          : p
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // 1. Deduct medicines from inventory
      if (prescribedList.length > 0) {
        await axios.post(
          'http://localhost:5000/api/medicines/deduct',
          { prescribed: prescribedList },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 2. Complete the consultation
      await axios.patch(
        `http://localhost:5000/api/appointments/${selectedAppointment._id}/consultation`,
        {
          ...form,
          medicinesPrescribed: prescribedList,
          consultationCompletedAt: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Consultation saved and inventory updated');
      setSelectedAppointment(null);
      setShowModal(false);
      fetchApprovedAppointments();
      fetchMedicines();
    } catch (err) {
      console.error('Error saving consultation:', err.message);
      alert('Failed to save consultation or deduct inventory');
    }
  };

  const filteredMedicines = medicineOptions.filter(med =>
    med.name.toLowerCase().includes(medicineSearch.toLowerCase())
  );

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

        {showModal && selectedAppointment && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-button" onClick={() => setShowModal(false)}>✖</button>
              <form onSubmit={handleSubmit} className="consultation-form">
                <h4 className="section-label">🩺 Vital Signs</h4>
                <input name="bloodPressure" placeholder="Blood Pressure (e.g. 120/80)" value={form.bloodPressure} onChange={handleChange} />
                <input name="temperature" placeholder="Temperature (°C)" value={form.temperature} onChange={handleChange} />
                <input name="oxygenSaturation" placeholder="Oxygen Saturation (%)" value={form.oxygenSaturation} onChange={handleChange} />
                <input name="heartRate" placeholder="Heart Rate (bpm)" value={form.heartRate} onChange={handleChange} />
                <input name="bmi" placeholder="BMI" value={form.bmi} onChange={handleChange} />
                <input name="bmiIntervention" placeholder="BMI Intervention" value={form.bmiIntervention} onChange={handleChange} />

                <h4 className="section-label">📝 Clinical Assessment</h4>
                <textarea name="diagnosis" placeholder="Diagnosis" value={form.diagnosis} onChange={handleChange} rows={3} />
                <textarea name="management" placeholder="Management Plan" value={form.management} onChange={handleChange} rows={3} />

                <h4 className="section-label">💊 Prescribe Medicines</h4>
                <input
                  type="text"
                  placeholder="Type medicine name..."
                  value={medicineSearch}
                  onChange={e => setMedicineSearch(e.target.value)}
                  onBlur={() => setTimeout(() => setMedicineSearch(''), 200)}
                  className="medicine-autocomplete"
                />
                {medicineSearch && (
  <ul className="autocomplete-suggestions">
    {filteredMedicines
      .filter(med => !prescribedList.some(p => p.medicineId === med._id))
      .slice(0, 5)
      .map(med => (
        <li
          key={med._id}
          onClick={() => {
            setPrescribedList(prev => [
              ...prev,
              {
                medicineId: med._id,
                name: med.name,
                quantity: 1,
                expiryDate: med.expiryDate // ✅ include expiry here
              }
            ]);
            setMedicineSearch('');
          }}
        >
          {med.name} ({med.quantityInStock} caps) — Exp: {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : '—'}
        </li>
      ))}
  </ul>
)}

                {prescribedList.length > 0 && (
  <div className="prescribed-list">
    {prescribedList.map(p => (
      <div key={p.medicineId} className="prescribed-row">
        <span>
          {p.name} — Exp: {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '—'}
        </span>
        <input
          type="number"
          min="1"
          value={p.quantity}
          onChange={e => handleQuantityChange(p.medicineId, e.target.value)}
          placeholder="Qty"
        />
        <button
          type="button"
          onClick={() =>
            setPrescribedList(prev => prev.filter(m => m.medicineId !== p.medicineId))
          }
        >
          ❌
        </button>
      </div>
    ))}
  </div>
)}

                <h4 className="section-label">📋 Referral & First Aid</h4>
                <label>
                  <input type="checkbox" name="referredToPhysician" checked={form.referredToPhysician} onChange={handleChange} />
                  Referred to Physician
                </label>
                <input name="physicianName" placeholder="Physician Name" value={form.physicianName} onChange={handleChange} />
                <label>First Aid Done</label>
                <select name="firstAidWithin30Mins" value={form.firstAidWithin30Mins} onChange={handleChange}>
                  <option value="y">Yes</option>
                  <option value="n">No</option>
                  <option value="n/a">N/A</option>
                
  </select>

  <button type="submit">✅ Save Consultation</button>
</form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

