import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');

    if (role === 'admin') {
      navigate('/admin-dashboard');
    } else if (role === 'patient') {
      navigate('/patient-dashboard');
    } else {
      navigate('/');
    }
  }, [navigate]); 

  return <p>Redirecting to your dashboard...</p>;
}