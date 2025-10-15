import './AuthForm.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!email || !newPassword) {
      alert('Please fill out both fields');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/reset-password', { email, newPassword });
      alert('Password reset successful. You can now log in.');
      navigate('/');
    } catch (err) {
      console.error('Reset failed:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        placeholder="New Password"
        type="password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      />
      <button onClick={handleReset}>Reset Password</button>
      <button onClick={() => navigate('/')}>Back to Login</button>
    </div>
  );
}