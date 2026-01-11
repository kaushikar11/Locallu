import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../config/firebase';
import { 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import Footer from '../components/Footer/Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { isDark } = useTheme();
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for Google redirect result on mount
  useEffect(() => {
    const checkGoogleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setLoading(true);
          console.log('[AUTH-FRONTEND] Google redirect result received');
          const user = result.user;
          
          // Get ID token from Firebase
          const idToken = await user.getIdToken();
          console.log('[AUTH-FRONTEND] Google ID token obtained');
          
          // Send ID token to backend for verification
          const response = await apiService.verifyToken(idToken);
          
          if (response.token && response.user) {
            console.log('[AUTH-FRONTEND] Google auth success:', { email: response.user.email, uid: response.user.uid });
            // Use setAuth to update both token and user
            setAuth(response.token, response.user);
            setLoading(false);
            window.location.href = '/select-role';
          } else {
            console.log('[AUTH-FRONTEND] Google auth failed - no token');
            setError('Failed to authenticate with Google');
            setLoading(false);
          }
        }
      } catch (err) {
        console.log('[AUTH-FRONTEND] Google redirect error:', err.message || err);
        console.error('Google redirect error:', err);
        setError(err.message || 'Failed to complete Google sign-in');
        setLoading(false);
      }
    };
    
    checkGoogleRedirect();
  }, [setAuth]);

  // Google OAuth handler
  const handleGoogleSignIn = async () => {
    console.log('[AUTH-FRONTEND] Google sign-in initiated');
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Use redirect instead of popup to avoid COOP issues
      await signInWithRedirect(auth, provider);
      // Navigation will happen after redirect result is processed
    } catch (err) {
      console.log('[AUTH-FRONTEND] Google sign-in initiation error:', err.message || err);
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to initiate Google sign-in');
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (authMode === 'signup' && (!password || password.length < 6)) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (authMode === 'login' && !password) {
      setError('Password is required for login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let firebaseUser;
      
      if (authMode === 'signup') {
        // Use Firebase Client SDK to create user
        console.log('[AUTH-FRONTEND] Signup attempt:', email);
        try {
          firebaseUser = await createUserWithEmailAndPassword(auth, email, password);
          console.log('[AUTH-FRONTEND] User created in Firebase:', firebaseUser.user.uid);
          
          // Update display name if provided
          if (name && firebaseUser.user) {
            await updateProfile(firebaseUser.user, { displayName: name });
            console.log('[AUTH-FRONTEND] Display name updated');
          }
        } catch (signupError) {
          console.error('[AUTH-FRONTEND] Signup error:', signupError.code, signupError.message);
          
          // Handle Firebase Auth errors
          if (signupError.code === 'auth/email-already-in-use') {
            setError('Email already registered. Please use the "Log in" tab instead.');
            setLoading(false);
            return;
          } else if (signupError.code === 'auth/invalid-email') {
            setError('Invalid email format');
            setLoading(false);
            return;
          } else if (signupError.code === 'auth/weak-password') {
            setError('Password is too weak. Please use at least 6 characters.');
            setLoading(false);
            return;
          } else {
            setError(signupError.message || 'Failed to create account. Please try again.');
            setLoading(false);
            return;
          }
        }
      } else {
        // Use Firebase Client SDK to sign in
        console.log('[AUTH-FRONTEND] Login attempt:', email);
        try {
          firebaseUser = await signInWithEmailAndPassword(auth, email, password);
          console.log('[AUTH-FRONTEND] User signed in to Firebase:', firebaseUser.user.uid);
        } catch (loginError) {
          console.error('[AUTH-FRONTEND] Login error:', loginError.code, loginError.message);
          
          // Handle Firebase Auth errors
          if (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/wrong-password' || loginError.code === 'auth/invalid-credential') {
            setError('Invalid email or password');
            setLoading(false);
            return;
          } else if (loginError.code === 'auth/invalid-email') {
            setError('Invalid email format');
            setLoading(false);
            return;
          } else {
            setError(loginError.message || 'Failed to sign in. Please try again.');
            setLoading(false);
            return;
          }
        }
      }

      // Get ID token from Firebase
      const idToken = await firebaseUser.user.getIdToken();
      console.log('[AUTH-FRONTEND] ID token obtained');
      
      // Send ID token to backend for verification
      const response = await apiService.verifyToken(idToken);
      
      if (response.token && response.user) {
        console.log('[AUTH-FRONTEND] Auth success:', { email: response.user.email, uid: response.user.uid });
        setAuth(response.token, response.user);
        setEmail('');
        setPassword('');
        setName('');
        setError('');
        setLoading(false);
        window.location.href = '/select-role';
      } else {
        setError('Failed to authenticate. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('[AUTH-FRONTEND] Unexpected error:', err);
      const errorMsg = err.response?.data?.error || err.message || `An error occurred during ${authMode}. Please try again.`;
      setError(errorMsg);
      setLoading(false);
    }
  };

  // Apple Design System Styles with inline fallback
  const styles = {
    root: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: isDark 
        ? '#000000' 
        : 'linear-gradient(135deg, #FFE5DD 0%, #FFFFFF 50%, #FFF3E0 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif',
    },
    background: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    },
    gradient1: {
      position: 'absolute',
      top: '10%',
      left: '25%',
      width: '400px',
      height: '400px',
      background: 'rgba(255, 152, 0, 0.3)',
      borderRadius: '50%',
      filter: 'blur(80px)',
    },
    gradient2: {
      position: 'absolute',
      bottom: '10%',
      right: '25%',
      width: '400px',
      height: '400px',
      background: 'rgba(255, 152, 0, 0.4)',
      borderRadius: '50%',
      filter: 'blur(80px)',
    },
    main: {
      position: 'relative',
      zIndex: 10,
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
    },
    container: {
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '48px',
      alignItems: 'center',
      marginBottom: '80px',
    },
    hero: {
      textAlign: 'left',
    },
    badge: {
      fontSize: '13px',
      fontWeight: 500,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      marginBottom: '24px',
      color: isDark ? '#FFB84D' : '#FF6B35',
      background: isDark 
        ? 'linear-gradient(135deg, rgba(255, 184, 77, 0.1), rgba(255, 184, 77, 0.05))' 
        : 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05))',
      padding: '8px 20px',
      borderRadius: '24px',
      display: 'inline-block',
    },
    title: {
      fontSize: 'clamp(48px, 6vw, 72px)',
      fontWeight: 700,
      lineHeight: 1.05,
      marginBottom: '24px',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      letterSpacing: '-0.03em',
    },
    titleAccent: {
      background: isDark 
        ? 'linear-gradient(135deg, #FFFFFF, #FFB84D)' 
        : 'linear-gradient(135deg, #1A1A1A, #FF6B35)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      fontSize: 'clamp(20px, 2.5vw, 24px)',
      fontWeight: 600,
      marginBottom: '12px',
      color: isDark ? '#ABABAB' : '#6B6B6B',
    },
    description: {
      fontSize: 'clamp(17px, 2vw, 19px)',
      color: isDark ? '#ABABAB' : '#6B6B6B',
      lineHeight: 1.6,
      maxWidth: '560px',
    },
    authCard: {
      maxWidth: '450px',
      width: '100%',
      margin: '0 auto',
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
      borderRadius: '24px',
      padding: '48px',
      boxShadow: isDark 
        ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
        : '0 8px 32px rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      padding: '4px',
      borderRadius: '12px',
    },
    tab: {
      flex: 1,
      padding: '12px 24px',
      textAlign: 'center',
      fontSize: '15px',
      fontWeight: 600,
      background: 'transparent',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: isDark ? '#ABABAB' : '#6B6B6B',
      fontFamily: 'inherit',
    },
    tabActive: {
      background: isDark 
        ? 'linear-gradient(135deg, #FFB84D, #FFA726)' 
        : 'linear-gradient(135deg, #FF6B35, #FF5722)',
      color: '#FFFFFF',
      boxShadow: isDark 
        ? '0 2px 8px rgba(255, 184, 77, 0.3)' 
        : '0 2px 8px rgba(255, 107, 53, 0.3)',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 600,
      marginBottom: '8px',
      color: isDark ? '#e5e7eb' : '#374151',
    },
    input: {
      width: '100%',
      padding: '12px 20px',
      fontSize: '16px',
      fontFamily: 'inherit',
      borderRadius: '12px',
      border: `1.5px solid ${error 
        ? (isDark ? '#FF453A' : '#FF3B30') 
        : 'transparent'}`,
      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      outline: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    inputFocus: {
      borderColor: isDark ? '#FFB84D' : '#FF6B35',
      boxShadow: isDark 
        ? '0 0 0 4px rgba(255, 184, 77, 0.1)' 
        : '0 0 0 4px rgba(255, 107, 53, 0.1)',
      background: isDark ? '#1C1C1E' : '#FFFFFF',
    },
    button: {
      width: '100%',
      padding: '14px 28px',
      fontSize: '16px',
      fontWeight: 600,
      fontFamily: 'inherit',
      borderRadius: '12px',
      border: 'none',
      background: isDark 
        ? 'linear-gradient(135deg, #FFB84D, #FFA726)' 
        : 'linear-gradient(135deg, #FF6B35, #FF5722)',
      color: '#FFFFFF',
      cursor: loading ? 'wait' : 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: loading ? 0.7 : 1,
      boxShadow: isDark 
        ? '0 4px 16px rgba(255, 184, 77, 0.3)' 
        : '0 4px 16px rgba(255, 107, 53, 0.3)',
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: isDark 
        ? '0 6px 24px rgba(255, 184, 77, 0.4)' 
        : '0 6px 24px rgba(255, 107, 53, 0.4)',
    },
    errorText: {
      fontSize: '14px',
      color: isDark ? '#FF453A' : '#FF3B30',
      marginTop: '8px',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '80px',
    },
    featureCard: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
      borderRadius: '16px',
      padding: '32px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isDark 
        ? '0 2px 12px rgba(0, 0, 0, 0.6)' 
        : '0 2px 8px rgba(0, 0, 0, 0.04)',
    },
    featureIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    },
    featureTitle: {
      fontSize: '20px',
      fontWeight: 700,
      marginBottom: '8px',
      color: isDark ? '#ffffff' : '#111827',
    },
    featureDesc: {
      fontSize: '14px',
      color: isDark ? '#9ca3af' : '#6b7280',
      lineHeight: 1.6,
    },
    trustSection: {
      textAlign: 'center',
      fontSize: '14px',
      color: isDark ? '#9ca3af' : '#6b7280',
    },
  };

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .landing-grid-lg {
            grid-template-columns: 1.2fr 1fr !important;
          }
        }
        .landing-input:focus {
          border-color: #f97316 !important;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1) !important;
        }
        .landing-button:hover:not(:disabled) {
          background: #ea580c !important;
        }
        .landing-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
      <div style={styles.root}>
        <div style={styles.background}>
          <div style={styles.gradient1}></div>
          <div style={styles.gradient2}></div>
        </div>

        <div style={styles.main}>
          <div style={styles.container}>
            <div style={{...styles.grid}} className="landing-grid-lg">
              <div style={styles.hero}>
                <p style={styles.badge}>Locallu • The World's First AI Employer</p>
                <h1 style={styles.title}>
                  AI that hires
                  <br />
                  <span style={styles.titleAccent}>you</span> back.
                </h1>
                <p style={styles.subtitle}>
                  One profile. Infinite tasks. Global opportunities.
                </p>
                <p style={styles.description}>
                  We match great talent with serious employers using AI and verified on-chain signals.
                  Log in or sign up in seconds to get started.
                </p>
              </div>

              <div style={styles.authCard} className="apple-card animate-fade-in-up">
                <div style={styles.tabs} className="apple-tabs">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setError('');
                    }}
                    style={{
                      ...styles.tab,
                      ...(authMode === 'login' ? styles.tabActive : {}),
                    }}
                    className={authMode === 'login' ? 'apple-tab-active' : 'apple-tab'}
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setError('');
                    }}
                    style={{
                      ...styles.tab,
                      ...(authMode === 'signup' ? styles.tabActive : {}),
                    }}
                    className={authMode === 'signup' ? 'apple-tab-active' : 'apple-tab'}
                  >
                    Sign up
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} style={styles.form}>
                  {authMode === 'signup' && (
                    <div>
                      <label style={styles.label} htmlFor="name">
                        Full name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      placeholder="Ada Lovelace"
                      style={styles.input}
                      className="apple-input landing-input"
                      />
                    </div>
                  )}

                  <div>
                    <label style={styles.label} htmlFor="email">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="you@example.com"
                      required
                      style={{
                        ...styles.input,
                        ...(error ? { borderColor: isDark ? '#FF453A' : '#FF3B30' } : {}),
                      }}
                      className={`apple-input landing-input ${error ? 'apple-input-error' : ''}`}
                      onFocus={(e) => {
                        if (!error) {
                          e.target.style.background = isDark ? '#1C1C1E' : '#FFFFFF';
                          e.target.style.borderColor = isDark ? '#FFB84D' : '#FF6B35';
                          e.target.style.boxShadow = isDark 
                            ? '0 0 0 4px rgba(255, 184, 77, 0.1)' 
                            : '0 0 0 4px rgba(255, 107, 53, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                        e.target.style.borderColor = error 
                          ? (isDark ? '#FF453A' : '#FF3B30') 
                          : 'transparent';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {error && <p style={styles.errorText}>{error}</p>}
                  </div>

                  <div>
                    <label style={styles.label} htmlFor="password">
                      Password {authMode === 'login' && <span style={{ fontSize: '12px', fontWeight: 400, opacity: 0.7 }}>(optional - for legacy accounts)</span>}
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder={authMode === 'signup' ? 'At least 6 characters' : 'Enter your password (optional)'}
                      required={authMode === 'signup'}
                      style={{
                        ...styles.input,
                        ...(error ? { borderColor: isDark ? '#FF453A' : '#FF3B30' } : {}),
                      }}
                      className={`apple-input landing-input ${error ? 'apple-input-error' : ''}`}
                      onFocus={(e) => {
                        if (!error) {
                          e.target.style.background = isDark ? '#1C1C1E' : '#FFFFFF';
                          e.target.style.borderColor = isDark ? '#FFB84D' : '#FF6B35';
                          e.target.style.boxShadow = isDark 
                            ? '0 0 0 4px rgba(255, 184, 77, 0.1)' 
                            : '0 0 0 4px rgba(255, 107, 53, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                        e.target.style.borderColor = error 
                          ? (isDark ? '#FF453A' : '#FF3B30') 
                          : 'transparent';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={styles.button}
                    className="apple-button apple-button-primary landing-button"
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = isDark 
                          ? '0 6px 24px rgba(255, 184, 77, 0.4)' 
                          : '0 6px 24px rgba(255, 107, 53, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = isDark 
                        ? '0 4px 16px rgba(255, 184, 77, 0.3)' 
                        : '0 4px 16px rgba(255, 107, 53, 0.3)';
                    }}
                    onMouseDown={(e) => {
                      e.target.style.transform = 'scale(0.98)';
                    }}
                    onMouseUp={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg
                          style={{
                            animation: 'spin 1s linear infinite',
                            marginRight: '12px',
                            width: '20px',
                            height: '20px',
                          }}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            style={{ opacity: 0.25 }}
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            style={{ opacity: 0.75 }}
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {authMode === 'login' ? 'Signing you in…' : 'Creating your account…'}
                      </span>
                    ) : (
                      authMode === 'login' ? 'Continue' : 'Create account & continue'
                    )}
                  </button>

                  <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '8px', color: styles.description.color }}>
                    By continuing, you agree to Locallu's Terms and acknowledge the Privacy Policy.
                  </p>
                </form>

                {/* Divider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '24px 0',
                  color: isDark ? '#6B6B6B' : '#9B9B9B',
                  fontSize: '14px'
                }}>
                  <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}></div>
                  <span style={{ padding: '0 16px' }}>or</span>
                  <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}></div>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px 28px',
                    fontSize: '16px',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    borderRadius: '12px',
                    border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                    background: isDark ? '#1C1C1E' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#1A1A1A',
                    cursor: loading ? 'wait' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = isDark 
                        ? '0 4px 16px rgba(0, 0, 0, 0.4)' 
                        : '0 4px 16px rgba(0, 0, 0, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                  onMouseDown={(e) => {
                    e.target.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                >
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    alt="Google logo" 
                    style={{ width: '20px', height: '20px' }} 
                  />
                  Sign in with Google
                </button>
              </div>
            </div>

            <div style={styles.featuresGrid}>
              {[
                { title: 'Automated Job Matching', description: 'AI-powered system matches you with the perfect tasks', icon: '🤖' },
                { title: 'Quality Verified', description: 'On-chain language models ensure work quality', icon: '✓' },
                { title: 'Custom Models', description: 'Upload your ML models and get paid when used', icon: '🧠' },
                { title: 'Global Opportunities', description: 'Access jobs from anywhere in the world', icon: '🌍' },
              ].map((feature, index) => (
                <div 
                  key={index} 
                  style={{...styles.featureCard, animationDelay: `${0.5 + index * 0.1}s`}} 
                  className="apple-card landing-feature-card animate-fade-in-up"
                >
                  <div style={styles.featureIcon}>{feature.icon}</div>
                  <h3 style={styles.featureTitle}>{feature.title}</h3>
                  <p style={styles.featureDesc}>{feature.description}</p>
                </div>
              ))}
            </div>

            <div style={styles.trustSection}>
              <p style={{ marginBottom: '8px' }}>Trusted by freelancers and businesses worldwide</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600 }}>✓ Secure Payments</span>
                <span style={{ fontWeight: 600 }}>✓ Verified Profiles</span>
                <span style={{ fontWeight: 600 }}>✓ 24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
