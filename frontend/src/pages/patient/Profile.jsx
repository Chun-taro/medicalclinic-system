import { useState, useEffect } from 'react';
import { FaCamera } from 'react-icons/fa';
import PatientLayout from './PatientLayout';
import './Style/Profile.css';
import { usePatient } from '../../context/PatientContext';

export default function Profile() {
  const { setPatient: setContextPatient } = usePatient(); // ✅ removed unused contextPatient

  const [patient, setPatient] = useState({});
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPatient(data);
        setEditForm(data);
        setContextPatient(data); // ✅ sync context
      }
    };

    fetchProfile();
  }, [setContextPatient]);


  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch('http://localhost:5000/api/profile/avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      setPatient(prev => ({ ...prev, avatar: data.avatar }));
      setContextPatient(prev => ({ ...prev, avatar: data.avatar })); // ✅ update context
      alert('Profile picture updated');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editForm)
    });
    const data = await res.json();
    if (res.ok) {
      setPatient(data.user);
      setContextPatient(data.user); // ✅ update context
      setShowEditModal(false);
      alert('Profile updated');
    }
  };

  
  return (
    <PatientLayout>
      <div className="fb-profile-container">
        <div className="fb-header-bar">
          <div className="fb-avatar-wrap">
            <img src={patient.avatar || '/avatar.png'} alt="Profile" className="fb-avatar" />
            <label className="fb-avatar-icon">
              <FaCamera />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />
            </label>
          </div>

          <div className="fb-header-info">
            <h1 className="fb-name">
              {patient.firstName}{' '}
              {patient.middleName ? `${patient.middleName} ` : ''}
              {patient.lastName}
            </h1>
            <p className="fb-subtitle">{patient.email}</p>
            <div className="fb-actions">
              <button
                className="fb-button"
                onClick={() => setShowEditModal(true)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>


        {/* About Section */}
        <div className="fb-content">
          <div className="fb-card">
            <h3>About</h3>
            <div className="fb-about-grid">
              <div><span className="fb-label">Sex</span><span className="fb-value">{patient.sex || '—'}</span></div>
              <div><span className="fb-label">Civil Status</span><span className="fb-value">{patient.civilStatus || '—'}</span></div>
              <div><span className="fb-label">Birthday</span><span className="fb-value">{patient.birthday?.slice(0, 10) || '—'}</span></div>
              <div><span className="fb-label">Address</span><span className="fb-value">{patient.homeAddress || '—'}</span></div>
              <div><span className="fb-label">Contact</span><span className="fb-value">{patient.contactNumber || '—'}</span></div>
              <div><span className="fb-label">Blood Type</span><span className="fb-value">{patient.bloodType || '—'}</span></div>
              <div><span className="fb-label">Emergency Contact</span><span className="fb-value">
                {patient.emergencyContact?.name || '—'} ({patient.emergencyContact?.relationship || '—'})
              </span></div>
              <div><span className="fb-label">Emergency Phone</span><span className="fb-value">{patient.emergencyContact?.phone || '—'}</span></div>
              <div><span className="fb-label">Allergies</span><span className="fb-value">{patient.allergies?.join(', ') || '—'}</span></div>
              <div><span className="fb-label">Medical History</span><span className="fb-value">{patient.medicalHistory?.join(', ') || '—'}</span></div>
              <div><span className="fb-label">Current Medications</span><span className="fb-value">{patient.currentMedications?.join(', ') || '—'}</span></div>
              <div><span className="fb-label">Family History</span><span className="fb-value">
                {Object.entries(patient.familyHistory || {}).map(([key, value]) =>
                  typeof value === 'boolean'
                    ? value ? `${key}, ` : ''
                    : value ? `Other: ${value}` : ''
                )}
              </span></div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Edit Details</h3>
      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        {['firstName', 'middleName', 'lastName', 'homeAddress', 'contactNumber'].map(field => (
          <div className="form-group" key={field}>
            <label>{field.replace(/([A-Z])/g, ' $1')}</label>
            <input
              type="text"
              name={field}
              value={editForm[field] || ''}
              onChange={handleChange}
            />
          </div>
        ))}

        {/* Selects */}
        <div className="form-group">
          <label>Sex</label>
          <select name="sex" value={editForm.sex || ''} onChange={handleChange}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Civil Status</label>
          <select name="civilStatus" value={editForm.civilStatus || ''} onChange={handleChange}>
            <option value="">Select</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="widowed">Widowed</option>
            <option value="divorced">Divorced</option>
          </select>
        </div>
        <div className="form-group">
          <label>Birthday</label>
          <input
            type="date"
            name="birthday"
            value={editForm.birthday?.slice(0, 10) || ''}
            onChange={handleChange}
          />
        </div>

        {/* Emergency Contact */}
        <h4>Emergency Contact</h4>
        {['name', 'relationship', 'phone'].map(field => (
          <div className="form-group" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              type="text"
              name={`emergencyContact.${field}`}
              value={editForm.emergencyContact?.[field] || ''}
              onChange={e =>
                setEditForm(prev => ({
                  ...prev,
                  emergencyContact: {
                    ...prev.emergencyContact,
                    [field]: e.target.value
                  }
                }))
              }
            />
          </div>
        ))}

        {/* Blood Type */}
        <div className="form-group">
          <label>Blood Type</label>
          <select
            name="bloodType"
            value={editForm.bloodType || ''}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>

        {/* Allergies, Medical History, Medications */}
        {['allergies', 'medicalHistory', 'currentMedications'].map(field => (
          <div className="form-group" key={field}>
            <label>{field.replace(/([A-Z])/g, ' $1')}</label>
            <input
              type="text"
              name={field}
              placeholder="Comma-separated values"
              value={editForm[field]?.join(', ') || ''}
              onChange={e =>
                setEditForm(prev => ({
                  ...prev,
                  [field]: e.target.value.split(',').map(item => item.trim())
                }))
              }
            />
          </div>
        ))}

        {/* Family History */}
        <h4>Family History</h4>
        {['diabetes', 'hypertension', 'heartDisease', 'cancer'].map(condition => (
          <div className="form-group" key={condition}>
            <label>
              <input
                type="checkbox"
                checked={editForm.familyHistory?.[condition] || false}
                onChange={e =>
                  setEditForm(prev => ({
                    ...prev,
                    familyHistory: {
                      ...prev.familyHistory,
                      [condition]: e.target.checked
                    }
                  }))
                }
              />
              {' '}{condition.charAt(0).toUpperCase() + condition.slice(1)}
            </label>
          </div>
        ))}
        <div className="form-group">
          <label>Other Family History</label>
          <input
            type="text"
            value={editForm.familyHistory?.other || ''}
            onChange={e =>
              setEditForm(prev => ({
                ...prev,
                familyHistory: {
                  ...prev.familyHistory,
                  other: e.target.value
                }
              }))
            }
          />
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button type="submit" className="save-button">Save Changes</button>
          <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}
      </div>
    </PatientLayout>
  );
}