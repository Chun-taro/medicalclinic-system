import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./Style/Reports.css";

function useRealTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export default function Reports() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [nameFilter, setNameFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const token = localStorage.getItem("token");
        const consultRes = await axios.get(
          "http://localhost:5000/api/appointments/consultations",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const sortedConsultations = consultRes.data.sort((a, b) => {
          const dateA = new Date(
            a.consultationCompletedAt || a.appointmentDate || 0
          );
          const dateB = new Date(
            b.consultationCompletedAt || b.appointmentDate || 0
          );
          return dateB - dateA;
        });

        setConsultations(sortedConsultations);
        if (sortedConsultations.length > 0) {
          setExpandedId(sortedConsultations[0]._id);
        }
      } catch (err) {
        console.error("Error fetching consultations:", err);
        setError("Failed to load consultations");
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const formatDateTime = (date) => {
    try {
      return date
        ? new Date(date).toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "—";
    } catch {
      return "—";
    }
  };

  const currentTime = useRealTime();

  // Check if consultation has been completed/filled
  const isConsultationComplete = (c) => {
    return !!(c.diagnosis || c.management || c.bloodPressure || c.temperature || c.heartRate);
  };

  const filteredConsultations = consultations.filter(c => {
    if (nameFilter) {
      const q = nameFilter.toLowerCase();
      const firstName = c.firstName || c.patientId?.firstName || '';
      const lastName = c.lastName || c.patientId?.lastName || '';
      const fullName = (firstName + ' ' + lastName).toLowerCase();
      if (!fullName.includes(q)) return false;
    }
    if (startDateFilter) {
      const start = new Date(startDateFilter);
      const consultDate = new Date(c.consultationCompletedAt || c.appointmentDate);
      if (consultDate < new Date(start.getFullYear(), start.getMonth(), start.getDate())) return false;
    }
    if (endDateFilter) {
      const end = new Date(endDateFilter);
      const consultDate = new Date(c.consultationCompletedAt || c.appointmentDate);
      if (consultDate > new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)) return false;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="reports-container">
        <div className="header-section">
          <h2>📊 Reports Dashboard</h2>
          <p>Monitor patient consultations.</p>
        </div>

        {loading ? (
          <p className="status-msg">Loading consultations...</p>
        ) : error ? (
          <p className="status-msg error">{error}</p>
        ) : (
          <>
            {/* Consultations */}
            <h3 className="section-title">🩺 Past Consultations</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by name..."
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                style={{ padding: '8px', minWidth: '180px' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                From <input type="date" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                To <input type="date" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} />
              </label>
              <button onClick={() => { setNameFilter(''); setStartDateFilter(''); setEndDateFilter(''); }}>Clear</button>
            </div>
            <div className="consultation-split-view">
              {/* Left list */}
              <div className="consultation-list">
              {filteredConsultations.length > 0 ? (
                filteredConsultations.map((c) => {
                    // use appointment-level name if present, otherwise fall back to populated patientId
                    const firstName = c.firstName || c.patientId?.firstName || 'Unknown';
                    const lastName = c.lastName || c.patientId?.lastName || '';
                    return (
                      <div
                        key={c._id}
                        className={`consultation-item ${
                          expandedId === c._id ? 'active' : ''
                        }`}
                        onClick={() => toggleExpand(c._id)}
                      >
                        <p className="patient-name">
                          {firstName} {lastName}
                        </p>
                        <p className="consult-date">
                          <strong>Date:</strong>{' '}
                          {formatDateTime(c.appointmentDate)}
                        </p>
                        <p className="consult-diagnosis">{c.diagnosis}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-list">No consultations found.</p>
                )}
              </div>

              {/* Right details */}
              <div className="consultation-details">
                {(() => {
                  const selected = consultations.find(
                    (c) => c._id === expandedId
                  );
                  if (!selected) return <p>Select a consultation to view details.</p>;

                  if (!isConsultationComplete(selected)) {
                    return (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>ℹ️ No consultation data</p>
                        <p>The admin has not filled in this consultation yet.</p>
                      </div>
                    );
                  }

                  const firstName = selected.firstName || selected.patientId?.firstName || 'Unknown';
                  const lastName = selected.lastName || selected.patientId?.lastName || '';

                  return (
                    <div key={selected._id}>
                      <h4>
                        {firstName} {lastName}
                      </h4>
                      <p>
                        <strong>Diagnosis:</strong> {selected.diagnosis}
                      </p>
                      <p>
                        <strong>Management:</strong> {selected.management}
                      </p>
                      <p>
                        <strong>Chief Complaint:</strong>{" "}
                        {selected.chiefComplaint}
                      </p>

                      <p>
                        <strong>Prescribed Medicines:</strong>
                      </p>
                      <ul>
                        {Array.isArray(selected.medicinesPrescribed)
                          ? selected.medicinesPrescribed.map((med, idx) => (
                              <li key={idx}>
                                {med.name} ×{med.quantity}
                              </li>
                            ))
                          : (
                            <li>{selected.medicinesPrescribed || "—"}</li>
                          )}
                      </ul>

                      <div style={{ backgroundColor: '#f0f7ff', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
                        <h5 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1e40af' }}>📊 Vitals</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                          <p style={{ margin: 0 }}><strong>Blood Pressure:</strong> {selected.bloodPressure || '—'}</p>
                          <p style={{ margin: 0 }}><strong>Temperature:</strong> {selected.temperature || '—'}°C</p>
                          <p style={{ margin: 0 }}><strong>Heart Rate:</strong> {selected.heartRate || '—'} bpm</p>
                          <p style={{ margin: 0 }}><strong>O₂ Saturation:</strong> {selected.oxygenSaturation || '—'}%</p>
                          <p style={{ margin: 0 }}><strong>BMI:</strong> {selected.bmi || '—'}</p>
                          <p style={{ margin: 0 }}><strong>BMI Intervention:</strong> {selected.bmiIntervention || '—'}</p>
                        </div>
                      </div>
                      <p>
                        <strong>Referred:</strong>{" "}
                        {selected.referredToPhysician
                          ? `Yes (${selected.physicianName || "—"})`
                          : "No"}
                      </p>
                      <p>
                        <strong>First Aid:</strong>{" "}
                        {selected.firstAidDone === "y" ? "Yes" : "No"} (
                        {selected.firstAidWithin30Mins})
                      </p>
                      <p>
                        <strong>Completed At:</strong>{" "}
                        {formatDateTime(
                          selected.consultationCompletedAt ||
                            selected.appointmentDate
                        )}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="footer-time">
              <p>🕒 Current time: {currentTime.toLocaleString()}</p>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}