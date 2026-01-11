import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';

const IndexPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, switchRole, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Wait for auth context to finish loading before checking authentication
    if (authLoading) {
      return;
    }
    
    // Only redirect if auth has finished loading and user is not authenticated
    if (!isAuthenticated || !user) {
      navigate('/index', { replace: true });
      return;
    }
    setLoading(false);
  }, [isAuthenticated, user, navigate, authLoading]);

  const handleRoleSelection = async (role) => {
    if (!user || !user.email) {
      navigate('/index');
      return;
    }

    setChecking(true);
    try {
      switchRole(role); // Set the role in context
      if (role === 'business') {
        const emailCheck = await apiService.checkBusinessEmail(user.email);
        if (emailCheck.exists) {
          navigate('/business/dashboard');
        } else {
          navigate('/business/form');
        }
      } else if (role === 'employee') {
        const emailCheck = await apiService.checkEmployeeEmail(user.email);
        if (emailCheck.exists) {
          navigate('/employee/dashboard');
        } else {
          navigate('/employee/form');
        }
      }
    } catch (error) {
      console.error('Error checking email:', error);
      if (role === 'business') {
        navigate('/business/form');
      } else {
        navigate('/employee/form');
      }
    } finally {
      setChecking(false);
    }
  };

  // Apple Design System Styles
  const styles = {
    root: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      background: isDark ? '#000000' : '#FAFAFA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
    },
    container: {
      maxWidth: '1000px',
      width: '100%',
    },
    header: {
      textAlign: 'center',
      marginBottom: '64px',
    },
    headline: {
      fontSize: 'clamp(40px, 5vw, 56px)',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      marginBottom: '16px',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
    },
    subtitle: {
      fontSize: 'clamp(17px, 2vw, 19px)',
      lineHeight: 1.5,
      color: isDark ? '#ABABAB' : '#6B6B6B',
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '32px',
      maxWidth: '900px',
      margin: '0 auto',
    },
    roleCard: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      padding: '48px',
      borderRadius: '24px',
      border: '2px solid transparent',
      boxShadow: isDark 
        ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
        : '0 4px 20px rgba(0, 0, 0, 0.06)',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    },
    iconContainer: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: isDark 
        ? 'linear-gradient(135deg, rgba(255, 184, 77, 0.1), rgba(255, 184, 77, 0.05))' 
        : 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px',
      transition: 'transform 0.3s ease',
    },
    icon: {
      fontSize: '40px',
      color: isDark ? '#FFB84D' : '#FF6B35',
    },
    cardTitle: {
      fontSize: 'clamp(24px, 3vw, 30px)',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      marginBottom: '12px',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
    },
    cardDescription: {
      fontSize: '17px',
      lineHeight: 1.6,
      color: isDark ? '#ABABAB' : '#6B6B6B',
      marginBottom: '24px',
    },
    arrowIcon: {
      position: 'absolute',
      right: '24px',
      bottom: '24px',
      fontSize: '24px',
      color: isDark ? 'rgba(255, 184, 77, 0.4)' : 'rgba(255, 107, 53, 0.4)',
      transition: 'all 0.3s ease',
    },
    loadingOverlay: {
      position: 'fixed',
      inset: 0,
      background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: `4px solid ${isDark ? 'rgba(255, 184, 77, 0.2)' : 'rgba(255, 107, 53, 0.2)'}`,
      borderTopColor: isDark ? '#FFB84D' : '#FF6B35',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    loadingText: {
      marginTop: '16px',
      fontSize: '15px',
      color: isDark ? '#ABABAB' : '#6B6B6B',
    },
  };

  if (loading) {
    return (
      <div style={styles.root}>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (min-width: 768px) {
          .role-cards-container {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        .role-card:hover {
          border-color: ${isDark ? '#FFB84D' : '#FF6B35'} !important;
          transform: translateY(-8px) !important;
          box-shadow: ${isDark 
            ? '0 12px 40px rgba(255, 184, 77, 0.2)' 
            : '0 12px 40px rgba(255, 107, 53, 0.2)'} !important;
        }
        .role-card:hover .icon-container {
          transform: rotate(5deg) scale(1.1) !important;
        }
        .role-card:hover .arrow-icon {
          opacity: 1 !important;
          transform: translateX(4px) !important;
        }
        .role-card:active {
          transform: scale(0.98) !important;
        }
      `}</style>
      
      {checking && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Checking your profile...</p>
        </div>
      )}

      <div style={styles.root}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.headline} className="display-medium">
              Choose Your Path
            </h1>
            <p style={styles.subtitle} className="body-large">
              Are you looking to hire talent or offer your skills?
            </p>
          </div>

          <div style={styles.cardsContainer} className="role-cards-container">
            <div
              onClick={() => handleRoleSelection('business')}
              style={styles.roleCard}
              className="role-card apple-card"
            >
              <div style={styles.iconContainer} className="icon-container">
                <span style={styles.icon}>🏢</span>
              </div>
              <h2 style={styles.cardTitle} className="heading-2">
                I'm a Business
              </h2>
              <p style={styles.cardDescription} className="body-regular">
                Post tasks, find skilled professionals, and grow your business
              </p>
              <span style={styles.arrowIcon} className="arrow-icon">→</span>
            </div>

            <div
              onClick={() => handleRoleSelection('employee')}
              style={styles.roleCard}
              className="role-card apple-card"
            >
              <div style={styles.iconContainer} className="icon-container">
                <span style={styles.icon}>👤</span>
              </div>
              <h2 style={styles.cardTitle} className="heading-2">
                I'm an Employee
              </h2>
              <p style={styles.cardDescription} className="body-regular">
                Browse opportunities, showcase your skills, and earn money
              </p>
              <span style={styles.arrowIcon} className="arrow-icon">→</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IndexPage;
