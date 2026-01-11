import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/UI/Button/Button';
import Input from '../components/UI/Input/Input';
import Modal from '../components/UI/Modal/Modal';
import Footer from '../components/Footer/Footer';

const BusinessTaskPage = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ description: '', price: '', dueDate: '' });
  const [reviewAction, setReviewAction] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const taskData = await apiService.getTask(taskId);
      setTask(taskData);
      setUpdateForm({
        description: taskData.description || '',
        price: taskData.price || '',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().slice(0, 16) : '',
      });

      // Load employee info if task is assigned
      if (taskData.assignedTo) {
        try {
          const empData = await apiService.getEmployeeDetails(taskData.assignedTo);
          setEmployeeInfo(empData);
        } catch (err) {
          console.log('Could not load employee info');
        }
      }
    } catch (error) {
      console.error('Error loading task:', error);
      alert('Task not found');
      navigate('/business/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await apiService.updateTask(taskId, updateForm);
      await loadTask();
      setShowUpdateModal(false);
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error.response?.data?.error || 'Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await apiService.deleteTask(taskId);
      navigate('/business/dashboard');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleReview = async () => {
    if (!reviewAction) {
      alert('Please select an action');
      return;
    }
    setReviewing(true);
    try {
      await apiService.reviewTask(taskId, reviewAction, reviewComments);
      await loadTask();
      setShowReviewModal(false);
      setReviewAction('');
      setReviewComments('');
    } catch (error) {
      console.error('Error reviewing task:', error);
      alert(error.response?.data?.error || 'Failed to review task');
    } finally {
      setReviewing(false);
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

  const getStatusBadgeClass = (status) => {
    const normalized = normalizeStatus(status);
    return `apple-badge-${normalized.replace('_', '-')}`;
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
    },
    reviewComment: {
      background: isDark ? 'rgba(0, 122, 255, 0.05)' : 'rgba(0, 122, 255, 0.05)',
      padding: '20px',
      borderLeft: `4px solid ${isDark ? '#0A84FF' : '#007AFF'}`,
      borderRadius: '12px',
      fontSize: '17px',
      lineHeight: 1.6,
      color: isDark ? '#ABABAB' : '#6B6B6B',
    },
    employeeInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    employeeAvatar: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      border: `2px solid ${isDark ? '#FFB84D' : '#FF6B35'}`,
      objectFit: 'cover',
    },
    employeeName: {
      fontSize: '18px',
      fontWeight: 600,
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: '4px',
    },
    employeeContact: {
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
          <Button onClick={() => navigate('/business/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const normalizedStatus = normalizeStatus(task.status);
  const statusColor = getStatusColor(normalizedStatus);

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
            onClick={() => navigate('/business/dashboard')}
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
                className={`apple-badge ${getStatusBadgeClass(normalizedStatus)}`}
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

          {/* Solution Section */}
          {task.solution && (
            <div style={styles.section} className="apple-card">
              <h2 style={styles.sectionHeader} className="heading-3">
                Solution Submitted
              </h2>
              <div style={styles.solutionBox}>
                {task.solution}
              </div>
              {normalizedStatus === 'submitted' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setReviewAction('approve');
                      setShowReviewModal(true);
                    }}
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setReviewAction('reject');
                      setShowReviewModal(true);
                    }}
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setReviewAction('request_changes');
                      setShowReviewModal(true);
                    }}
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    Request Changes
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Review Comments */}
          {task.reviewComments && (
            <div style={styles.section} className="apple-card">
              <h2 style={styles.sectionHeader} className="heading-3">
                Review Comments
              </h2>
              <div style={styles.reviewComment}>
                {task.reviewComments}
              </div>
              <p style={{ fontSize: '13px', color: isDark ? '#6B6B6B' : '#9B9B9B', marginTop: '12px' }}>
                Reviewed on: {formatDate(task.reviewedAt)}
              </p>
            </div>
          )}

          {/* Employee Info */}
          {employeeInfo && (
            <div style={styles.section} className="apple-card">
              <h2 style={styles.sectionHeader} className="heading-3">
                Assigned Employee
              </h2>
              <div style={styles.employeeInfo}>
                <img
                  src={employeeInfo.photoURL || employeeInfo.employeeImage || `https://ui-avatars.com/api/?name=${employeeInfo.firstName}+${employeeInfo.lastName}`}
                  alt={employeeInfo.displayName || 'Employee'}
                  style={styles.employeeAvatar}
                />
                <div>
                  <div style={styles.employeeName} className="heading-4">
                    {employeeInfo.displayName || `${employeeInfo.firstName} ${employeeInfo.lastName}`}
                  </div>
                  <div style={styles.employeeContact} className="ui-regular">
                    {employeeInfo.email || 'No contact info'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.actionsBar} className="task-actions-bar">
            <Button
              variant="secondary"
              onClick={() => setShowUpdateModal(true)}
              style={{ flex: 1 }}
            >
              Update Task
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              style={{ flex: 1 }}
            >
              Delete Task
            </Button>
          </div>
        </div>

        {/* Update Modal */}
        <Modal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          title="Update Task"
        >
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Input
              label="Description"
              type="textarea"
              value={updateForm.description}
              onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
              required
            />
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              min="0"
              value={updateForm.price}
              onChange={(e) => setUpdateForm({ ...updateForm, price: e.target.value })}
              required
            />
            <Input
              label="Due Date"
              type="datetime-local"
              value={updateForm.dueDate}
              onChange={(e) => setUpdateForm({ ...updateForm, dueDate: e.target.value })}
              required
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <Button
                variant="secondary"
                onClick={() => setShowUpdateModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={updating}
                style={{ flex: 1 }}
              >
                Update Task
              </Button>
            </div>
          </form>
        </Modal>

        {/* Review Modal */}
        <Modal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setReviewAction('');
            setReviewComments('');
          }}
          title={`${reviewAction === 'approve' ? 'Approve' : reviewAction === 'reject' ? 'Reject' : 'Request Changes'} Task`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Input
              label="Review Comments"
              type="textarea"
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder={reviewAction === 'request_changes' ? 'What changes are needed?' : 'Add your comments (optional)'}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewAction('');
                  setReviewComments('');
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant={reviewAction === 'approve' ? 'primary' : reviewAction === 'reject' ? 'danger' : 'secondary'}
                onClick={handleReview}
                loading={reviewing}
                style={{ flex: 1 }}
              >
                {reviewAction === 'approve' ? 'Approve' : reviewAction === 'reject' ? 'Reject' : 'Request Changes'}
              </Button>
            </div>
          </div>
        </Modal>

        <Footer />
      </div>
    </>
  );
};

export default BusinessTaskPage;
