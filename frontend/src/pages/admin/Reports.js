import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Reports.css';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const [statsRes, consultRes] = await Promise.all([
          axios.get('http://localhost:5000/api/appointments/reports', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/appointments/consultations', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setStats(statsRes.data);
        setConsultations(consultRes.data);
      } catch (err) {
        console.error('Error fetching reports:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <AdminLayout>
      <div className="reports-container">
        <h2>📊 Reports</h2>
        <p>System metrics and consultation history.</p>

        {loading ? (
          <p>Loading reports...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            <div className="report-cards">
              {Object.entries(stats).map(([key, value]) => (
                <div className="card" key={key}>
                  <strong>{key.replace(/([A-Z])/g, ' $1')}</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>

            <h3>🩺 Past Consultations</h3>
            <div className="consultation-split-view">
              <div className="consultation-list">
                {consultations.map(c => (
                  <div
                    key={c._id}
                    className={`consultation-item ${expandedId === c._id ? 'active' : ''}`}
                    onClick={() => toggleExpand(c._id)}
                  >
                    <p><strong>{c.firstName} {c.lastName}</strong></p>
                    <p>{new Date(c.date).toLocaleDateString()}</p>
                    <p>{c.diagnosis}</p>
                  </div>
                ))}
              </div>

              <div className="consultation-details">
                {consultations.map(c => (
                  expandedId === c._id && (
                    <div key={`expanded-${c._id}`}>
                      <h4>{c.firstName} {c.lastName}</h4>
                      <p><strong>Date:</strong> {new Date(c.date).toLocaleDateString()}</p>
                      <p><strong>Diagnosis:</strong> {c.diagnosis}</p>
                      <p><strong>Management:</strong> {c.management}</p>
                      <p><strong>Chief Complaint:</strong> {c.chiefComplaint}</p>
                      <p><strong>Prescribed Medicines:</strong> {c.medicinesPrescribed}</p>
                      <p><strong>Vitals:</strong> BP: {c.bloodPressure}, Temp: {c.temperature}, HR: {c.heartRate}, O₂: {c.oxygenSaturation}, BMI: {c.bmi}</p>
                      <p><strong>Referred:</strong> {c.referredToPhysician ? `Yes (${c.physicianName || '—'})` : 'No'}</p>
                      <p><strong>First Aid:</strong> {c.firstAidDone === 'y' ? 'Yes' : 'No'} ({c.firstAidWithin30Mins})</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}