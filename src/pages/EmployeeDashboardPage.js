import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/UI/Button/Button';
import Modal from '../components/UI/Modal/Modal';
import Input from '../components/UI/Input/Input';
import Footer from '../components/Footer/Footer';

const EmployeeDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [assigning, setAssigning] = useState(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, [user]);

  const loadEmployeeData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const { employeeId: id } = await apiService.getEmployeeIdByUserId(user.uid);
      setEmployeeId(id);

      if (id) {
        const [employeeData, availableTasksData, assignedTasksData] = await Promise.all([
          apiService.getEmployeeDetails(id),
          apiService.getUnassignedTasks(),
          apiService.getAssignedTasks(id),
        ]);
        setEmployee(employeeData);
        setAvailableTasks(availableTasksData || []);
        setAssignedTasks(assignedTasksData || []);

        try {
          const { profilePictureUrl } = await apiService.getEmployeeProfilePicture(id);
          setProfilePicture(profilePictureUrl);
        } catch (error) {
          console.log('No profile picture found');
        }
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (taskId) => {
    if (!employeeId) return;

    setAssigning(taskId);
    try {
      await apiService.assignTask(taskId, employeeId);
      await apiService.updateTaskStatus(taskId, 'assigned', 'Task assigned to employee');
      await loadEmployeeData();
    } catch (error) {
      console.error('Error assigning task:', error);
      alert(error.response?.data?.error || 'Failed to assign task');
    } finally {
      setAssigning(null);
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      await apiService.updateTaskStatus(taskId, 'in_progress', 'Employee started working on task');
      await loadEmployeeData();
    } catch (error) {
      console.error('Error starting task:', error);
      alert(error.response?.data?.error || 'Failed to start task');
    }
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!selectedTask || !solution.trim()) {
      alert('Please enter a solution');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.submitTaskSolution(selectedTask.id, solution.trim());
      await apiService.updateTaskStatus(selectedTask.id, 'submitted', 'Solution submitted');
      await loadEmployeeData();
      setShowSolutionModal(false);
      setSelectedTask(null);
      setSolution('');
    } catch (error) {
      console.error('Error submitting solution:', error);
      alert(error.response?.data?.error || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const openSolutionModal = (task) => {
    setSelectedTask(task);
    setSolution(task.solution || '');
    setShowSolutionModal(true);
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
      maxWidth: '1400px',
      width: '100%',
      margin: '0 auto',
      padding: '40px clamp(24px, 5vw, 48px)',
      flex: 1,
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      padding: '32px',
      borderRadius: '20px',
      boxShadow: isDark 
        ? '0 2px 12px rgba(0, 0, 0, 0.6)' 
        : '0 2px 12px rgba(0, 0, 0, 0.06)',
      marginBottom: '40px',
    },
    avatar: {
      width: '96px',
      height: '96px',
      borderRadius: '50%',
      border: `3px solid ${isDark ? '#FFB84D' : '#FF6B35'}`,
      boxShadow: isDark 
        ? '0 4px 16px rgba(255, 184, 77, 0.2)' 
        : '0 4px 16px rgba(255, 107, 53, 0.2)',
      objectFit: 'cover',
    },
    profileInfo: {
      flex: 1,
      maxWidth: '600px',
    },
    profileName: {
      fontSize: 'clamp(28px, 3.5vw, 36px)',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: '8px',
    },
    profileDescription: {
      fontSize: '17px',
      lineHeight: 1.5,
      color: isDark ? '#ABABAB' : '#6B6B6B',
    },
    editButton: {
      marginLeft: 'auto',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '48px',
    },
    statCard: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      padding: '24px',
      borderRadius: '16px',
      borderLeft: `4px solid ${isDark ? '#FFB84D' : '#FF6B35'}`,
      boxShadow: isDark 
        ? '0 2px 8px rgba(0, 0, 0, 0.6)' 
        : '0 2px 8px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    statIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: isDark ? 'rgba(255, 184, 77, 0.1)' : 'rgba(255, 107, 53, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      color: isDark ? '#FFB84D' : '#FF6B35',
      marginBottom: '12px',
    },
    statValue: {
      fontSize: '32px',
      fontWeight: 700,
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: '4px',
    },
    statLabel: {
      fontSize: '14px',
      fontWeight: 500,
      color: isDark ? '#ABABAB' : '#6B6B6B',
    },
    tabsContainer: {
      display: 'inline-flex',
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      padding: '4px',
      borderRadius: '12px',
      boxShadow: isDark 
        ? '0 2px 8px rgba(0, 0, 0, 0.6)' 
        : '0 2px 8px rgba(0, 0, 0, 0.06)',
      marginBottom: '24px',
    },
    tab: {
      padding: '10px 24px',
      fontSize: '15px',
      fontWeight: 500,
      background: 'transparent',
      border: 'none',
      borderRadius: '10px',
      color: isDark ? '#ABABAB' : '#6B6B6B',
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
    tasksGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
      gap: '24px',
    },
    taskCard: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      padding: '24px',
      borderRadius: '16px',
      borderTop: `4px solid ${isDark ? '#FFB84D' : '#FF6B35'}`,
      boxShadow: isDark 
        ? '0 2px 12px rgba(0, 0, 0, 0.6)' 
        : '0 2px 12px rgba(0, 0, 0, 0.06)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    },
    taskStatusBadge: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    taskName: {
      fontSize: '18px',
      fontWeight: 600,
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: '8px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    taskDescription: {
      fontSize: '15px',
      lineHeight: 1.5,
      color: isDark ? '#ABABAB' : '#6B6B6B',
      marginBottom: '16px',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    taskMetadata: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '16px',
      borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
      marginBottom: '16px',
    },
    taskPrice: {
      fontSize: '18px',
      fontWeight: 700,
      color: isDark ? '#FFB84D' : '#FF6B35',
    },
    taskDate: {
      fontSize: '13px',
      color: isDark ? '#6B6B6B' : '#9B9B9B',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    taskButton: {
      width: '100%',
      height: '40px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: 600,
      fontFamily: 'inherit',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 24px',
    },
    emptyIcon: {
      fontSize: '200px',
      opacity: 0.3,
      marginBottom: '24px',
    },
    emptyTitle: {
      fontSize: 'clamp(24px, 3vw, 30px)',
      fontWeight: 600,
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: '12px',
    },
    emptyText: {
      fontSize: '17px',
      color: isDark ? '#ABABAB' : '#6B6B6B',
      marginBottom: '32px',
    },
  };

  if (loading) {
    return (
      <div style={{...styles.root, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{ fontSize: '18px', color: isDark ? '#FFFFFF' : '#1A1A1A' }}>Loading...</div>
      </div>
    );
  }

  const currentTasks = activeTab === 'available' ? availableTasks : assignedTasks;
  const stats = {
    available: availableTasks.length,
    assigned: assignedTasks.filter(t => normalizeStatus(t.status) === 'assigned').length,
    inProgress: assignedTasks.filter(t => normalizeStatus(t.status) === 'in_progress').length,
    completed: assignedTasks.filter(t => normalizeStatus(t.status) === 'approved').length,
  };

  return (
    <>
      <style>{`
        .stat-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: ${isDark 
            ? '0 8px 24px rgba(0, 0, 0, 0.7)' 
            : '0 8px 24px rgba(0, 0, 0, 0.08)'} !important;
        }
        .task-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: ${isDark 
            ? '0 12px 32px rgba(0, 0, 0, 0.8)' 
            : '0 12px 32px rgba(0, 0, 0, 0.12)'} !important;
        }
        .task-card:active {
          transform: scale(0.98) !important;
        }
        .tab-button:hover:not(.tab-active) {
          background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} !important;
        }
        @media (max-width: 1024px) {
          .tasks-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
          }
        }
        @media (max-width: 640px) {
          .tasks-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div style={styles.root}>
        <div style={styles.container} className="animate-fade-in-up">
          {/* Profile Header */}
          <div style={styles.profileHeader} className="apple-card">
            <img
              src={profilePicture || `https://ui-avatars.com/api/?name=${employee?.firstName}+${employee?.lastName}`}
              alt={employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'}
              style={styles.avatar}
            />
            <div style={styles.profileInfo}>
              <h1 style={styles.profileName} className="heading-1">
                {employee ? `${employee.firstName} ${employee.lastName}` : 'Employee Dashboard'}
              </h1>
              <p style={styles.profileDescription} className="body-regular">
                {employee?.aboutEmployee || 'Find and complete tasks to earn money'}
              </p>
            </div>
            <div style={styles.editButton}>
              <Button
                variant="secondary"
                onClick={() => navigate('/employee/edit')}
              >
                ✎ Edit Profile
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            {[
              { label: 'Available Tasks', value: stats.available, icon: '🔍', color: isDark ? '#FFB84D' : '#FF6B35' },
              { label: 'Assigned', value: stats.assigned, icon: '📋', color: isDark ? '#0A84FF' : '#007AFF' },
              { label: 'In Progress', value: stats.inProgress, icon: '🔄', color: isDark ? '#FFB84D' : '#FF9500' },
              { label: 'Completed', value: stats.completed, icon: '✓', color: isDark ? '#32D74B' : '#34C759' },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.statCard,
                  borderLeftColor: stat.color,
                }}
                className="stat-card apple-card"
              >
                <div style={{...styles.statIcon, background: `${stat.color}20`, color: stat.color}}>
                  {stat.icon}
                </div>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={styles.tabsContainer} className="apple-tabs">
            <button
              onClick={() => setActiveTab('available')}
              style={{
                ...styles.tab,
                ...(activeTab === 'available' ? styles.tabActive : {}),
              }}
              className={`tab-button ${activeTab === 'available' ? 'tab-active apple-tab-active' : 'apple-tab'}`}
            >
              Available Tasks
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              style={{
                ...styles.tab,
                ...(activeTab === 'assigned' ? styles.tabActive : {}),
              }}
              className={`tab-button ${activeTab === 'assigned' ? 'tab-active apple-tab-active' : 'apple-tab'}`}
            >
              My Tasks
            </button>
          </div>

          {/* Tasks Grid */}
          {currentTasks.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                {activeTab === 'available' ? '📭' : '📋'}
              </div>
              <h2 style={styles.emptyTitle} className="heading-2">
                {activeTab === 'available' ? 'No available tasks' : 'No tasks assigned yet'}
              </h2>
              <p style={styles.emptyText} className="body-regular">
                {activeTab === 'available' 
                  ? 'Check back later for new opportunities'
                  : 'Browse available tasks to get started'}
              </p>
              {activeTab === 'assigned' && (
                <Button
                  variant="primary"
                  onClick={() => setActiveTab('available')}
                >
                  Browse Available Tasks
                </Button>
              )}
            </div>
          ) : (
            <div style={styles.tasksGrid} className="tasks-grid">
              {currentTasks.map((task) => {
                const normalizedStatus = normalizeStatus(task.status);
                const statusColor = getStatusColor(normalizedStatus);
                return (
                  <div
                    key={task.id}
                    onClick={() => activeTab === 'available' ? null : navigate(`/employee/task/${task.id}`)}
                    style={{
                      ...styles.taskCard,
                      borderTopColor: statusColor,
                      cursor: activeTab === 'available' ? 'default' : 'pointer',
                    }}
                    className="task-card apple-card"
                  >
                    <span
                      style={{
                        ...styles.taskStatusBadge,
                        background: `${statusColor}20`,
                        color: statusColor,
                      }}
                      className={`apple-badge apple-badge-${normalizedStatus.replace('_', '-')}`}
                    >
                      {normalizedStatus.replace('_', ' ')}
                    </span>
                    <h3 style={styles.taskName} className="heading-4">
                      {task.name}
                    </h3>
                    <p style={styles.taskDescription} className="body-small">
                      {task.description}
                    </p>
                    <div style={styles.taskMetadata}>
                      <div style={styles.taskPrice} className="heading-4">
                        ${task.price}
                      </div>
                      <div style={styles.taskDate} className="ui-small">
                        📅 {formatDate(task.dueDate)}
                      </div>
                    </div>
                    {activeTab === 'available' && (
                      <Button
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignTask(task.id);
                        }}
                        loading={assigning === task.id}
                        style={{ width: '100%', height: '40px' }}
                      >
                        {assigning === task.id ? 'Claiming...' : 'Claim Task'}
                      </Button>
                    )}
                    {activeTab === 'assigned' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {normalizedStatus === 'assigned' && (
                          <Button
                            variant="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartTask(task.id);
                            }}
                            style={{ flex: 1, height: '40px' }}
                          >
                            Start Working
                          </Button>
                        )}
                        {(normalizedStatus === 'in_progress' || normalizedStatus === 'assigned') && (
                          <Button
                            variant="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSolutionModal(task);
                            }}
                            style={{ flex: 1, height: '40px' }}
                          >
                            {task.solution ? 'Update' : 'Submit Solution'}
                          </Button>
                        )}
                        {normalizedStatus === 'submitted' && (
                          <Button
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/employee/task/${task.id}`);
                            }}
                            style={{ width: '100%', height: '40px' }}
                          >
                            View Submission
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Solution Modal */}
        <Modal
          isOpen={showSolutionModal}
          onClose={() => {
            setShowSolutionModal(false);
            setSelectedTask(null);
            setSolution('');
          }}
          title={selectedTask ? `Submit Solution: ${selectedTask.name}` : 'Submit Solution'}
        >
          <form onSubmit={handleSubmitSolution} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {selectedTask && (
              <>
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: isDark ? '#ABABAB' : '#6B6B6B' }}>
                    Task Description:
                  </p>
                  <p style={{ fontSize: '17px', lineHeight: 1.6, color: isDark ? '#ABABAB' : '#6B6B6B' }}>
                    {selectedTask.description}
                  </p>
                </div>
                <Input
                  label="Your Solution"
                  type="textarea"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Enter your solution, code, or response here..."
                  required
                />
              </>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowSolutionModal(false);
                  setSelectedTask(null);
                  setSolution('');
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                disabled={!solution.trim()}
                style={{ flex: 1 }}
              >
                Submit Solution
              </Button>
            </div>
          </form>
        </Modal>

        <Footer />
      </div>
    </>
  );
};

export default EmployeeDashboardPage;
