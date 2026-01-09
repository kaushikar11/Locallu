import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '17px',
        color: 'var(--text-secondary)'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to index page with return path
    return <Navigate to="/index" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

