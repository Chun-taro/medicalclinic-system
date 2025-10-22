import { useState, useEffect } from 'react';
import PatientLayout from './PatientLayout';
import './Profile.css';

export default function Profile() {
  const [patient, setPatient] = useState({});
  const [editForm, setEditForm] = useState({});
  const [showModal, setShowModal] = useState(false);

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
      } else {
        console.error('Fetch error:', data.error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
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
      setShowModal(false);
      alert('Profile updated');
    } else {
      alert('Failed to save profile');
    }
  };

  const handleAvatarChange = async e => {
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
      alert('Profile picture updated');
    } else {
      alert('Failed to upload image');
    }
  };

  return (
    <PatientLayout>
      <div className="profile-container">
        {/* Profile Card */}
        <div className="profile-card">
          <img
  src={patient.avatar ? `http://localhost:5000${patient.avatar}` : '/avatar.png'}
  alt="Profile"
  className="profile-avatar-small"
/>
          <h2>{patient.firstName} {patient.middleName ? patient.middleName + ' ' : ''}{patient.lastName}</h2>
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Sex:</strong> {patient.sex || '—'}</p>
          <p><strong>Civil Status:</strong> {patient.civilStatus || '—'}</p>
          <p><strong>Birthday:</strong> {patient.birthday || '—'}</p>
          <p><strong>Address:</strong> {patient.homeAddress || '—'}</p>
          <p><strong>Contact:</strong> {patient.contactNumber || '—'}</p>

          {/* Upload Profile Picture */}
          <div className="avatar-upload">
            <label htmlFor="avatarInput" className="upload-label">Upload Profile Picture</label>
            <input
              type="file"
              id="avatarInput"
              accept="image/*"
              onChange={handleAvatarChange}
              className="upload-input"
            />
          </div>

          <button className="edit-profile-button" onClick={() => setShowModal(true)}>
            Edit Profile
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit Profile</h3>
              <form onSubmit={handleSubmit}>
                {/* Text Inputs */}
                {['firstName', 'lastName', 'middleName', 'homeAddress', 'contactNumber'].map(field => (
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

                {/* Sex Dropdown */}
                <div className="form-group">
                  <label>Sex</label>
                  <select name="sex" value={editForm.sex || ''} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Civil Status Dropdown */}
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

                {/* Birthday Input */}
                <div className="form-group">
                  <label>Birthday</label>
                  <input
                    type="date"
                    name="birthday"
                    value={editForm.birthday?.slice(0, 10) || ''}
                    onChange={handleChange}
                  />
                </div>

                {/* Actions */}
                <div className="modal-actions">
                  <button type="submit" className="save-button">Save Changes</button>
                  <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}