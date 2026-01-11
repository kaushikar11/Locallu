import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, currentRole, switchRole } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/index');
  };

  if (location.pathname === '/' || location.pathname === '/index') {
    return null;
  }

  // Apple design system styles with fallback
  const styles = {
    nav: {
      position: 'sticky',
      top: 0,
      zIndex: 200,
      height: '72px',
      background: isDark 
        ? 'rgba(0, 0, 0, 0.8)' 
        : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 24px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      fontSize: '24px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: isDark ? '#FFB84D' : '#FF6B35',
      textDecoration: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    themeButton: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      border: 'none',
      background: isDark 
        ? 'rgba(255, 184, 77, 0.1)' 
        : 'rgba(255, 107, 53, 0.1)',
      color: isDark ? '#FFB84D' : '#FF6B35',
      fontSize: '20px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    userText: {
      fontSize: '15px',
      fontWeight: 500,
      color: isDark ? '#ABABAB' : '#6B6B6B',
      padding: '8px 16px',
      background: isDark 
        ? 'rgba(255, 184, 77, 0.08)' 
        : 'rgba(255, 107, 53, 0.08)',
      borderRadius: '20px',
    },
    logoutButton: {
      padding: '10px 20px',
      borderRadius: '10px',
      border: 'none',
      background: isDark ? 'rgba(255, 69, 58, 0.1)' : 'rgba(255, 59, 48, 0.1)',
      color: isDark ? '#FF453A' : '#FF3B30',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    roleSwitcher: {
      padding: '8px 16px',
      borderRadius: '10px',
      border: 'none',
      background: isDark ? 'rgba(255, 184, 77, 0.15)' : 'rgba(255, 107, 53, 0.15)',
      color: isDark ? '#FFB84D' : '#FF6B35',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      textTransform: 'capitalize',
    },
  };

  return (
    <nav style={styles.nav} className="apple-navbar">
      <div style={styles.container} className="apple-navbar-container">
        <Link 
          to="/" 
          style={styles.logo}
          className="apple-navbar-logo"
        >
          Locallu
        </Link>
        <div style={styles.rightSection}>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={styles.themeButton}
            onMouseEnter={(e) => {
              e.target.style.background = isDark 
                ? 'rgba(255, 184, 77, 0.15)' 
                : 'rgba(255, 107, 53, 0.15)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = isDark 
                ? 'rgba(255, 184, 77, 0.1)' 
                : 'rgba(255, 107, 53, 0.1)';
              e.target.style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
          >
            {isDark ? '☀︎' : '☾'}
          </button>
          {isAuthenticated && user && (
            <>
              <button
                onClick={() => {
                  const newRole = currentRole === 'business' ? 'employee' : 'business';
                  switchRole(newRole);
                  navigate(newRole === 'business' ? '/business/dashboard' : '/employee/dashboard');
                }}
                style={styles.roleSwitcher}
                onMouseEnter={(e) => {
                  e.target.style.background = isDark 
                    ? 'rgba(255, 184, 77, 0.2)' 
                    : 'rgba(255, 107, 53, 0.2)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = isDark 
                    ? 'rgba(255, 184, 77, 0.15)' 
                    : 'rgba(255, 107, 53, 0.15)';
                  e.target.style.transform = 'translateY(0)';
                }}
                title={`Switch to ${currentRole === 'business' ? 'Employee' : 'Business'} view`}
              >
                {currentRole === 'business' ? '👔 Business' : '👤 Employee'} ⇄
              </button>
              <span style={styles.userText}>
                {user.displayName || user.email}
              </span>
              <button
                onClick={handleLogout}
                style={styles.logoutButton}
                onMouseEnter={(e) => {
                  e.target.style.background = isDark 
                    ? 'rgba(255, 69, 58, 0.15)' 
                    : 'rgba(255, 59, 48, 0.15)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = isDark 
                    ? 'rgba(255, 69, 58, 0.1)' 
                    : 'rgba(255, 59, 48, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
