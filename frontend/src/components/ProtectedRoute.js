import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Check if token exists and is not empty
  if (!token || token.trim() === '') {
    console.log('No token found, redirecting to login');
    return <Navigate to="/" replace />;
  }

  // Check if role exists and matches required role
  if (requiredRole && (!role || role !== requiredRole)) {
    console.log(`Role mismatch: expected ${requiredRole}, got ${role}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
