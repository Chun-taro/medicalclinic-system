import './AuthForm.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) {
      alert('Please fill out all fields');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/auth/signup', form, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Save auth data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('role', res.data.role);

      alert('Signup successful');
      navigate(res.data.role === 'admin' ? '/admin-dashboard' : '/patient-dashboard');
    } catch (err) {
      console.error('Signup failed:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <input
        placeholder="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <select
        value={form.role}
        onChange={e => setForm({ ...form, role: e.target.value })}
      >
        <option value="patient">Patient</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleSignup} disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      <button onClick={() => navigate('/')}>Back to Login</button>
    </div>
  );
}