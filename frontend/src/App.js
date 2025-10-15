import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllAppointments from './pages/admin/AllAppointments';
import ManageUsers from './pages/admin/ManageUsers';
import Reports from './pages/admin/Reports';
import ConsultationPage from './pages/admin/ConsultationPage';
import Inventory from './pages/admin/Inventory'; // ✅ NEW

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import MyAppointments from './pages/patient/MyAppointments';
import BookAppointment from './pages/patient/BookAppointment';
import Profile from './pages/patient/Profile';
import MyConsultations from './pages/patient/MyConsultations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin-appointments" element={
          <ProtectedRoute requiredRole="admin">
            <AllAppointments />
          </ProtectedRoute>
        } />
        <Route path="/admin-users" element={
          <ProtectedRoute requiredRole="admin">
            <ManageUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin-reports" element={
          <ProtectedRoute requiredRole="admin">
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/admin-consultation/:id" element={
          <ProtectedRoute requiredRole="admin">
            <ConsultationPage />
          </ProtectedRoute>
        } />
        <Route path="/admin-inventory" element={
          <ProtectedRoute requiredRole="admin">
            <Inventory />
          </ProtectedRoute>
        } />

        {/* Patient routes */}
        <Route path="/patient-dashboard" element={
          <ProtectedRoute requiredRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient-appointments" element={
          <ProtectedRoute requiredRole="patient">
            <MyAppointments />
          </ProtectedRoute>
        } />
        <Route path="/patient-book" element={
          <ProtectedRoute requiredRole="patient">
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="/patient-profile" element={
          <ProtectedRoute requiredRole="patient">
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/patient-consultations" element={
          <ProtectedRoute requiredRole="patient">
            <MyConsultations />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;