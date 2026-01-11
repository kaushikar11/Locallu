import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/UI/Button/Button';
import Input from '../components/UI/Input/Input';
import Footer from '../components/Footer/Footer';

const DoTaskPage = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [unassigning, setUnassigning] = useState(false);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const taskData = await apiService.getTask(taskId);
      setTask(taskData);
      setSolution(taskData.solution || '');

      // Load business info
      if (taskData.businessId) {
        try {
          const busData = await apiService.getBusinessDetails(taskData.businessId);
          setBusinessInfo(busData);
        } catch (err) {
          console.log('Could not load business info');
        }
      }
    } catch (error) {
      console.error('Error loading task:', error);
      alert('Task not found');
      navigate('/employee/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    if (!window.confirm('Start working on this task?')) return;

    setStarting(true);
    try {
      await apiService.updateTaskStatus(taskId, 'in_progress', 'Employee started working on task');
      await loadTask();
    } catch (error) {
      console.error('Error starting task:', error);
      alert(error.response?.data?.error || 'Failed to start task');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    
    if (!solution.trim()) {
      alert('Please enter a solution');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.submitTaskSolution(taskId, solution.trim());
      await apiService.updateTaskStatus(taskId, 'submitted', 'Solution submitted');
      await loadTask();
    } catch (error) {
      console.error('Error submitting solution:', error);
      alert(error.response?.data?.error || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    if (!window.confirm('Are you sure you want to unassign from this task?')) return;
    
    setUnassigning(true);
    try {
      await apiService.unassignTask(taskId);
      navigate('/employee/dashboard');
    } catch (error) {
      console.error('Error unassigning task:', error);
      alert(error.response?.data?.error || 'Failed to unassign task');
    } finally {
      setUnassigning(false);
    }
  };

  const normalizeStatus = (status) => {
    if (typeof status === 'string') return status;
    if (Array.isArray(status) && status[0]?.percentage !== undefined) {
      const pct = status[0].percentage;
      if (pct === 0) return 'pending';
      if (pct < 100) return 'in_progress';
      return 'approved';
    }
    return 'pending';
  };

  const getStatusColor = (status) => {
    const normalized = normalizeStatus(status);
    const colors = {
      pending: isDark ? '#9B9B9B' : '#9B9B9B',
      assigned: isDark ? '#0A84FF' : '#007AFF',
      in_progress: isDark ? '#FFB84D' : '#FF9500',
      submitted: '#5856D6',
      reviewed: '#5856D6',
      approved: isDark ? '#32D74B' : '#34C759',
      rejected: isDark ? '#FF453A' : '#FF3B30',
    };
    return colors[normalized] || colors.pending;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Apple Design System Styles
  const styles = {
    root: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: isDark ? '#000000' : '#FAFAFA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
    },
    container: {
      maxWidth: '900px',
      width: '100%',
      margin: '0 auto',
      padding: '40px clamp(24px, 5vw, 48px)',
      paddingBottom: '120px', // Extra padding to prevent footer overlap
      flex: 1,
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '15px',
      fontWeight: 500,
      color: isDark ? '#ABABAB' : '#6B6B6B',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      marginBottom: '24px',
      transition: 'all 0.2s ease',
      padding: '8px 0',
    },
    headerCard: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: isDark 
        ? '0 4px 20px rgba(0, 0, 0, 0.6)' 
        : '0 4px 20px rgba(0, 0, 0, 0.08)',
      marginBottom: '32px',
    },
    titleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      gap: '16px',
      flexWrap: 'wrap',
    },
    taskName: {
      fontSize: 'clamp(28px, 3.5vw, 36px)',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      flex: 1,
    },
    metaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      margin: '24px 0',
    },
    metaItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    metaIcon: {
      fontSize: '24px',
      color: isDark ? '#FFB84D' : '#FF6B35',
      marginBottom: '8px',
    },
    metaLabel: {
      fontSize: '13px',
      color: isDark ? '#6B6B6B' : '#9B9B9B',
      fontWeight: 500,
    },
    metaValue: {
      fontSize: '16px',
      fontWeight: 500,
      color: isDark ? '#FFFFFF' : '#1A1A1A',
    },
    description: {
      fontSize: '17px',
      lineHeight: 1.7,
      color: isDark ? '#ABABAB' : '#6B6B6B',
      paddingTop: '24px',
      borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
    },
    section: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      padding: '32px',
      borderRadius: '16px',
      boxShadow: isDark 
        ? '0 2px 12px rgba(0, 0, 0, 0.6)' 
        : '0 2px 12px rgba(0, 0, 0, 0.06)',
      marginBottom: '24px',
    },
    sectionHeader: {
      fontSize: 'clamp(20px, 2.5vw, 24px)',
      fontWeight: 600,
      marginBottom: '20px',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      borderLeft: `4px solid ${isDark ? '#FFB84D' : '#FF6B35'}`,
      paddingLeft: '16px',
    },
    solutionBox: {
      background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
      padding: '20px',
      borderRadius: '12px',
      fontFamily: '"SF Mono", "Monaco", "Courier New", monospace',
      fontSize: '14px',
      lineHeight: 1.6,
      whiteSpace: 'pre-wrap',
      color: isDark ? '#ABABAB' : '#6B6B6B',
      marginBottom: '24px',
    },
    successBox: {
      background: isDark ? 'rgba(52, 199, 89, 0.1)' : 'rgba(52, 199, 89, 0.1)',
      border: `1.5px solid ${isDark ? '#32D74B' : '#34C759'}`,
      padding: '20px',
      borderRadius: '12px',
      fontSize: '17px',
      fontWeight: 600,
      color: isDark ? '#32D74B' : '#34C759',
      marginBottom: '24px',
    },
    errorBox: {
      background: isDark ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.1)',
      border: `1.5px solid ${isDark ? '#FF453A' : '#FF3B30'}`,
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '24px',
    },
    errorTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: isDark ? '#FF453A' : '#FF3B30',
      marginBottom: '8px',
    },
    errorText: {
      fontSize: '17px',
      lineHeight: 1.6,
      color: isDark ? '#ABABAB' : '#6B6B6B',
    },
    businessInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    businessAvatar: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      border: `2px solid ${isDark ? '#FFB84D' : '#FF6B35'}`,
      objectFit: 'cover',
    },
    businessName: {
      fontSize: '18px',
      fontWeight: 600,
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: '4px',
    },
    businessContact: {
      fontSize: '14px',
      color: isDark ? '#ABABAB' : '#6B6B6B',
    },
    actionsBar: {
      display: 'flex',
      gap: '12px',
      padding: '24px',
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: '16px',
      boxShadow: isDark 
        ? '0 2px 12px rgba(0, 0, 0, 0.6)' 
        : '0 2px 12px rgba(0, 0, 0, 0.06)',
      marginTop: '32px',
      marginBottom: '80px', // Add margin to prevent footer overlap
    },
  };

  if (loading) {
    return (
      <div style={{...styles.root, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{ fontSize: '18px', color: isDark ? '#FFFFFF' : '#1A1A1A' }}>Loading...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{...styles.root, alignItems: 'center', justifyContent: 'center'}}>
        <div style={styles.section} className="apple-card">
          <p style={{ textAlign: 'center', color: isDark ? '#ABABAB' : '#6B6B6B', marginBottom: '24px' }}>
            Task not found
          </p>
          <Button onClick={() => navigate('/employee/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const normalizedStatus = normalizeStatus(task.status);
  const statusColor = getStatusColor(normalizedStatus);
  const canStart = normalizedStatus === 'assigned';
  const canSubmit = normalizedStatus === 'in_progress' || normalizedStatus === 'assigned';
  const isSubmitted = ['submitted', 'reviewed', 'approved', 'rejected'].includes(normalizedStatus);

  return (
    <>
      <style>{`
        .back-button:hover {
          color: ${isDark ? '#FFB84D' : '#FF6B35'} !important;
          transform: translateX(-4px) !important;
        }
        .task-actions-bar {
          position: relative !important;
          margin-bottom: 80px !important;
        }
      `}</style>
      <div style={styles.root}>
        <div style={styles.container} className="animate-fade-in-up">
          {/* Back Button */}
          <button
            onClick={() => navigate('/employee/dashboard')}
            style={styles.backButton}
            className="back-button"
          >
            ← Back to Dashboard
          </button>

          {/* Task Header Card */}
          <div style={styles.headerCard} className="apple-card">
            <div style={styles.titleRow}>
              <h1 style={styles.taskName} className="heading-1">
                {task.name}
              </h1>
              <span
                className={`apple-badge apple-badge-${normalizedStatus.replace('_', '-')}`}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {normalizedStatus.replace('_', ' ')}
              </span>
            </div>

            {/* Meta Info Grid */}
            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <span style={styles.metaIcon}>💰</span>
                <span style={styles.metaLabel}>Price</span>
                <span style={{...styles.metaValue, color: statusColor, fontSize: '20px', fontWeight: 700}}>
                  ${task.price}
                </span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaIcon}>📅</span>
                <span style={styles.metaLabel}>Due Date</span>
                <span style={styles.metaValue}>{formatDate(task.dueDate)}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaIcon}>🕐</span>
                <span style={styles.metaLabel}>Created</span>
                <span style={styles.metaValue}>{formatDate(task.dateCreated)}</span>
              </div>
            </div>

            {/* Description */}
            <p style={styles.description} className="body-regular">
              {task.description}
            </p>
          </div>

          {/* Business Info */}
          {businessInfo && (
            <div style={styles.section} className="apple-card">
              <h2 style={styles.sectionHeader} className="heading-3">
                Business Information
              </h2>
              <div style={styles.businessInfo}>
                <img
                  src={businessInfo.photoURL || businessInfo.businessImage || `https://ui-avatars.com/api/?name=${businessInfo.businessName}`}
                  alt={businessInfo.businessName || 'Business'}
                  style={styles.businessAvatar}
                />
                <div>
                  <div style={styles.businessName} className="heading-4">
                    {businessInfo.businessName}
                  </div>
                  <div style={styles.businessContact} className="ui-regular">
                    {businessInfo.email || 'No contact info'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Solution Section */}
          <div style={styles.section} className="apple-card">
            <h2 style={styles.sectionHeader} className="heading-3">
              Your Solution
            </h2>

            {/* Submitted Solution */}
            {isSubmitted && task.solution && (
              <div style={styles.solutionBox}>
                {task.solution}
              </div>
            )}

            {/* Rejected Feedback */}
            {normalizedStatus === 'rejected' && task.reviewComments && (
              <div style={styles.errorBox}>
                <div style={styles.errorTitle}>Review Feedback:</div>
                <div style={styles.errorText}>{task.reviewComments}</div>
              </div>
            )}

            {/* Approved Message */}
            {normalizedStatus === 'approved' && (
              <div style={styles.successBox}>
                ✓ Task Approved! Payment will be processed.
              </div>
            )}

            {/* Solution Form */}
            {canSubmit && (
              <form onSubmit={handleSubmitSolution} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <Input
                  label="Enter Your Solution"
                  type="textarea"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Enter your solution, code, or response here..."
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="medium"
                  loading={submitting}
                  style={{ width: '100%' }}
                >
                  {task.solution ? 'Update Solution' : 'Submit Solution'}
                </Button>
              </form>
            )}
          </div>

          {/* Action Buttons */}
          <div style={styles.actionsBar} className="task-actions-bar">
            {canStart && (
              <Button
                variant="primary"
                onClick={handleStartTask}
                loading={starting}
                style={{ flex: 1, width: '100%' }}
              >
                Start Working
              </Button>
            )}
            {normalizedStatus === 'assigned' && (
              <Button
                variant="secondary"
                onClick={handleUnassign}
                loading={unassigning}
                style={{ flex: 1 }}
              >
                Unassign
              </Button>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default DoTaskPage;
