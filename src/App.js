import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Pages
import HomePage from './pages/HomePage';
import IndexPage from './pages/IndexPage';
import BusinessFormPage from './pages/BusinessFormPage';
import EmployeeFormPage from './pages/EmployeeFormPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import BusinessEditPage from './pages/BusinessEditPage';
import EmployeeEditPage from './pages/EmployeeEditPage';
import BusinessTaskPage from './pages/BusinessTaskPage';
import DoTaskPage from './pages/DoTaskPage';
import ProfileEditPage from './pages/ProfileEditPage';

// Layout
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Loading component
const LoadingScreen = () => {
  const { isDark } = useTheme();
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`text-lg ${isDark ? 'text-white' : 'text-gray-700'}`}>Loading...</div>
    </div>
  );
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/index" replace />} />
        <Route path="index" element={<HomePage />} />
        <Route path="select-role" element={<IndexPage />} />
        
        {/* Business Routes */}
        <Route 
          path="business/form" 
          element={
            <ProtectedRoute>
              <BusinessFormPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="business/dashboard" 
          element={
            <ProtectedRoute>
              <BusinessDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="business/edit" 
          element={
            <ProtectedRoute>
              <BusinessEditPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="business/task/:taskId" 
          element={
            <ProtectedRoute>
              <BusinessTaskPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Employee Routes */}
        <Route 
          path="employee/form" 
          element={
            <ProtectedRoute>
              <EmployeeFormPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="employee/dashboard" 
          element={
            <ProtectedRoute>
              <EmployeeDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="employee/edit" 
          element={
            <ProtectedRoute>
              <EmployeeEditPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="employee/task/:taskId" 
          element={
            <ProtectedRoute>
              <DoTaskPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile Edit Route (works for both business and employee) */}
        <Route 
          path="profile/edit" 
          element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/index" replace />} />
      </Route>
    </Routes>
  );
}

export default App;

