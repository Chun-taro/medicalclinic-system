import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './ManageUsers.css';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('admin'); // ✅ track which tab is active

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(prev =>
        prev.map(user => (user._id === id ? { ...user, role: newRole } : user))
      );
    } catch (err) {
      console.error('Error updating role:', err.message);
    }
  };

  const renderTable = role => {
    const filtered = users.filter(user => user.role === role);
    return filtered.length === 0 ? (
      <p>No {role}s found.</p>
    ) : (
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(user => (
            <tr key={user._id}>
              <td>{user.name || `${user.firstName} ${user.lastName}`}</td>
              <td>{user.email}</td>
              <td>
                <span
                  className={`role-badge ${
                    user.role === 'admin' ? 'role-admin' : 'role-patient'
                  }`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </td>
              <td>
                <select
                  value={user.role}
                  onChange={e => handleRoleChange(user._id, e.target.value)}
                >
                  <option value="admin">admin</option>
                  <option value="patient">patient</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <AdminLayout>
      <h2>Manage Users</h2>
      <p>View, edit, or change user roles.</p>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          {/* ✅ Tab Buttons */}
          <div className="tabs">
            <button
              className={activeTab === 'admin' ? 'active' : ''}
              onClick={() => setActiveTab('admin')}
            >
              Admins
            </button>
            <button
              className={activeTab === 'patient' ? 'active' : ''}
              onClick={() => setActiveTab('patient')}
            >
              Patients
            </button>
          </div>

          {/* ✅ Tab Content */}
          <div className="tab-content">
            {activeTab === 'admin' && renderTable('admin')}
            {activeTab === 'patient' && renderTable('patient')}
          </div>
        </>
      )}
    </AdminLayout>
  );
}