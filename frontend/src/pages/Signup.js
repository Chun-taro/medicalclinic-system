import './Auth.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Recaptcha from '../components/Recaptcha';

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'patient'
  });
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaError, setRecaptchaError] = useState('');
  const navigate = useNavigate();

  const handleRecaptchaVerify = (token) => {
    setRecaptchaToken(token);
    setRecaptchaError('');
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken('');
    setRecaptchaError('reCAPTCHA expired. Please verify again.');
  };

  const handleSignup = async () => {
    const { firstName, lastName, email, password } = form;
    if (!firstName || !lastName || !email || !password) {
      alert('Please fill out all fields');
      return;
    }

    if (!recaptchaToken) {
      setRecaptchaError('Please complete the reCAPTCHA verification.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', {
        ...form,
        recaptchaToken
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('role', res.data.role);

      alert('Signup successful');
      navigate('/patient-dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="form-wrapper">
          <h2>Create Your Account</h2>

          <a href="http://localhost:5000/api/auth/google">
            <button className="google-button">Sign Up with Google</button>
          </a>

          <input
            type="text"
            placeholder="First Name"
            value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <input type="hidden" value="patient" />

          {/* reCAPTCHA Component */}
          <div className="recaptcha-container">
            <Recaptcha 
              onVerify={handleRecaptchaVerify}
              onExpire={handleRecaptchaExpire}
            />
            {recaptchaError && (
              <p className="recaptcha-error">{recaptchaError}</p>
            )}
          </div>

          <button onClick={handleSignup}>Sign Up</button>
          
          <p>
            Already have an account? <span onClick={() => navigate('/')}>Login here</span>
          </p>
        </div>
      </div>
      <div className="auth-right">
        <img src="https://buksu.edu.ph/wp-content/uploads/2020/11/DSC_6474.jpg" alt="Medical background" />
      </div>
    </div>
  );
}