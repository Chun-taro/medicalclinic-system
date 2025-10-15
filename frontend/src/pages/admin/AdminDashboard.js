import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalUsers: 0,
    todayAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [appointmentsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/appointments', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const today = new Date().toDateString();
        const todayAppointments = appointmentsRes.data.filter(apt => 
          new Date(apt.date).toDateString() === today
        ).length;

        setStats({
          totalAppointments: appointmentsRes.data.length,
          totalUsers: usersRes.data.length,
          todayAppointments
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <AdminLayout><p>Loading dashboard...</p></AdminLayout>;

  return (
    <AdminLayout>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Total Appointments</h3>
          <p style={{ fontSize: '2em', margin: '10px 0', color: '#007bff' }}>{stats.totalAppointments}</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '2em', margin: '10px 0', color: '#28a745' }}>{stats.totalUsers}</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Today's Appointments</h3>
          <p style={{ fontSize: '2em', margin: '10px 0', color: '#ffc107' }}>{stats.todayAppointments}</p>
        </div>
        
      </div>
    </AdminLayout>
  );
}