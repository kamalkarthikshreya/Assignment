/**
 * App.jsx - Root component with routing and auth protection
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AgentsPage from './pages/AgentsPage';
import UploadPage from './pages/UploadPage';

// Route guard: redirect to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="full-loader">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Redirect authenticated users away from login
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="full-loader">Loading...</div>;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={
      <PublicRoute><LoginPage /></PublicRoute>
    } />
    <Route path="/dashboard" element={
      <ProtectedRoute><Dashboard /></ProtectedRoute>
    }>
      <Route index element={<Navigate to="agents" replace />} />
      <Route path="agents" element={<AgentsPage />} />
      <Route path="upload" element={<UploadPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          draggable
          theme="dark"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
