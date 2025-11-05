import './Auth.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Recaptcha from '../components/Recaptcha';
import logo from './assets/logo.png';
import GoogleLogo from './assets/google-logo.png';
import backgroundImage from './assets/building.png';
import { usePatient } from '../context/PatientContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaError, setRecaptchaError] = useState('');
  const navigate = useNavigate();
  const { setPatient } = usePatient();

  const handleRecaptchaVerify = (token) => {
    setRecaptchaToken(token);
    setRecaptchaError('');
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken('');
    setRecaptchaError('reCAPTCHA expired. Please verify again.');
  };

  const handleLogin = async () => {
    if (!recaptchaToken) {
      setRecaptchaError('Please complete the reCAPTCHA verification.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        ...form,
        recaptchaToken
      });

      const { token, userId, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('role', role);

      const profileRes = await axios.get('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileRes.status === 200) {
        setPatient(profileRes.data);
      }

      navigate(role === 'admin' ? '/admin-dashboard' : '/patient-dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div
      className="auth-wrapper"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="image-overlay"></div>

      <div className="auth-right">
        <div className="form-wrapper">
          <div className="form-header center-align">
            <img src={logo} alt="BukSU Medical Logo" className="clinic-logo" />
            <h2 className="clinic-title">BukSU<br />Medical Clinic</h2>
            <hr className="form-divider" />
          </div>
<p className="google-label">Continue with Google</p>
          <a href="http://localhost:5000/api/auth/google" style={{ textDecoration: "none" }}>
  <button
    style={{
      border: "none",
      backgroundColor: "transparent",
      padding: "0",
      cursor: "pointer"
    }}
  >
    <img
      src={GoogleLogo}
      alt="Google logo"
      style={{
        width: "90px",
        height: "40px"
      }}
    />
  </button>
</a>
          <input
            type="text"
            placeholder="Email or phone number"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <div className="recaptcha-container">
            <Recaptcha
              onVerify={handleRecaptchaVerify}
              onExpire={handleRecaptchaExpire}
            />
            {recaptchaError && <p className="recaptcha-error">{recaptchaError}</p>}
          </div>

          <button onClick={handleLogin}>Continue →</button>

          <p>
            Don't have an account? <span onClick={() => navigate('/signup')}>Register here</span>
          </p>

          <p className="forgot-password">
            <span onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
          </p>
        </div>
      </div>
    </div>
  );
}