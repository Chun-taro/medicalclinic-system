import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './ManageUsers.css'; // optional styling

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      await axios.put(`http://localhost:5000/api/users/${id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(prev =>
        prev.map(user => user._id === id ? { ...user, role: newRole } : user)
      );
    } catch (err) {
      console.error('Error updating role:', err.message);
    }
  };

  const renderTable = (title, role) => {
    const filtered = users.filter(user => user.role === role);
    return (
      <>
        <h3>{title}</h3>
        {filtered.length === 0 ? (
          <p>No {title.toLowerCase()} found.</p>
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
                  <td>{user.role}</td>
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
        )}
      </>
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
          {renderTable('Admins', 'admin')}
          {renderTable('Patients', 'patient')}
        </>
      )}
    </AdminLayout>
  );
}