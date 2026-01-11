import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiService } from '../utils/api';

// Simple JWT decode function
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Check if token is expired or will expire soon (within 1 hour)
function isTokenExpiringSoon(token) {
  if (!token) return true;
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  
  // Return true if token expires within 1 hour
  return (expirationTime - now) < oneHour;
}

// Check if token is expired
function isTokenExpired(token) {
  if (!token) return true;
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const expirationTime = decoded.exp * 1000;
  return Date.now() >= expirationTime;
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('currentRole') || null;
  });
  const refreshIntervalRef = useRef(null);
  const activityTimeoutRef = useRef(null);

  // Helper function to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Initialize from localStorage and cookies on mount
  useEffect(() => {
    // Try to get token from cookie first, then localStorage
    let storedToken = getCookie('jwt_token') || localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      try {
        // Verify token is not expired
        if (!isTokenExpired(storedToken)) {
          setToken(storedToken);
          // If we have user in localStorage, use it; otherwise decode from token
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            const decoded = decodeJWT(storedToken);
            if (decoded) {
              const userData = {
                uid: decoded.uid,
                email: decoded.email,
                displayName: decoded.displayName,
                photoURL: decoded.photoURL
              };
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          }
          // Sync token to localStorage if it came from cookie
          if (!localStorage.getItem('token')) {
            localStorage.setItem('token', storedToken);
          }
        } else {
          // Token expired - clear storage and cookies
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
    setLoading(false);
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!token || !user) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    // Check token expiration every 5 minutes
    refreshIntervalRef.current = setInterval(async () => {
      const currentToken = localStorage.getItem('token');
      
      if (!currentToken) {
        // Token was removed, clear state
        setToken(null);
        setUser(null);
        return;
      }

      if (isTokenExpired(currentToken)) {
        // Token expired - logout
        logout();
        return;
      }

      // If token is expiring soon (within 1 hour), refresh it
      if (isTokenExpiringSoon(currentToken)) {
        try {
          const response = await apiService.refreshToken();
          if (response.token && response.user) {
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            // Cookie is updated by backend
            console.log('✅ Token refreshed automatically');
          }
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // If refresh fails, token might be invalid - logout
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout();
          }
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [token, user]);

  // Activity-based session extension
  useEffect(() => {
    if (!token || !user) return;

    const extendSessionOnActivity = () => {
      // Clear existing timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      // Set new timeout to refresh token after 30 minutes of inactivity
      activityTimeoutRef.current = setTimeout(async () => {
        const currentToken = localStorage.getItem('token');
        if (currentToken && !isTokenExpired(currentToken)) {
          try {
            const response = await apiService.refreshToken();
            if (response.token && response.user) {
              setToken(response.token);
              setUser(response.user);
              localStorage.setItem('token', response.token);
              localStorage.setItem('user', JSON.stringify(response.user));
              // Cookie is updated by backend
            }
          } catch (error) {
            console.error('Failed to extend session:', error);
          }
        }
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, extendSessionOnActivity, { passive: true });
    });

    // Initial setup
    extendSessionOnActivity();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, extendSessionOnActivity);
      });
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [token, user]);

  const login = async (email) => {
    try {
      setLoading(true);
      const response = await apiService.getUserId(email);
      const { token: newToken, user: userData } = response;

      if (newToken && userData) {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        // Cookie is set by backend, but ensure it's synced
        return { success: true, token: newToken, user: userData };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear cookie
    document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Clear intervals
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = null;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiService.refreshToken();
      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        // Cookie is updated by backend
        return { success: true, token: response.token, user: response.user };
      }
      return { success: false, error: 'Invalid refresh response' };
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout
      logout();
      return { success: false, error: error.response?.data?.error || 'Failed to refresh token' };
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Also update token if provided
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      setToken(currentToken);
    }
  };

  const switchRole = (role) => {
    if (role === 'business' || role === 'employee') {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
    }
  };

  // Helper to set both token and user (for after authentication)
  const setAuth = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshToken,
    updateUser,
    setAuth, // Expose setAuth for updating both token and user
    currentRole,
    switchRole,
    isAuthenticated: !!token && !!user && !isTokenExpired(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
