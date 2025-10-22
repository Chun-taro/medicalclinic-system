import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Reports.css';

function useRealTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

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

        const sortedConsultations = consultRes.data.sort((a, b) => {
          const dateA = new Date(a.consultationCompletedAt || a.appointmentDate || 0);
          const dateB = new Date(b.consultationCompletedAt || b.appointmentDate || 0);
          return dateB - dateA;
        });

        setStats(statsRes.data);
        setConsultations(sortedConsultations);

        if (sortedConsultations.length > 0) {
          setExpandedId(sortedConsultations[0]._id);
        }
      } catch (err) {
        console.error('Error fetching reports:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    document.body.style.overflow = expandedId ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [expandedId]);

  const formatDateTime = (date) => {
  try {
    return date
      ? new Date(date).toLocaleString('en-US', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      : '—';
  } catch {
    return '—';
  }
};

  const currentTime = useRealTime();

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
                    <p><strong>Date:</strong> {formatDateTime(c.appointmentDate)}</p>
                    <p>{c.diagnosis}</p>
                  </div>
                ))}
              </div>

              <div className="consultation-details">
  {(() => {
    const selected = consultations.find(c => c._id === expandedId);
    if (!selected) return null;

    return (
      <div key={`expanded-${selected._id}`}>
        <h4>{selected.firstName} {selected.lastName}</h4>
        <p><strong>Diagnosis:</strong> {selected.diagnosis}</p>
        <p><strong>Management:</strong> {selected.management}</p>
        <p><strong>Chief Complaint:</strong> {selected.chiefComplaint}</p>
        <p><strong>Prescribed Medicines:</strong></p>
        <ul>
          {Array.isArray(selected.medicinesPrescribed)
            ? selected.medicinesPrescribed.map((med, idx) => (
                <li key={idx}>{med.name} x{med.quantity}</li>
              ))
            : <li>{selected.medicinesPrescribed || '—'}</li>}
        </ul>
        <p><strong>Vitals:</strong> BP: {selected.bloodPressure}, Temp: {selected.temperature}, HR: {selected.heartRate}, O₂: {selected.oxygenSaturation}, BMI: {selected.bmi}</p>
        <p><strong>Referred:</strong> {selected.referredToPhysician ? `Yes (${selected.physicianName || '—'})` : 'No'}</p>
        <p><strong>First Aid:</strong> {selected.firstAidDone === 'y' ? 'Yes' : 'No'} ({selected.firstAidWithin30Mins})</p>
       
  <p><strong>Completed At:</strong> {formatDateTime(selected.consultationCompletedAt || selected.appointmentDate)}</p>

      </div>
    );
  })()}
</div>
            </div>

            <p>Current time: {currentTime.toLocaleString()}</p>
          </>
        )}
      </div>
    </AdminLayout>
  );
}