import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/UI/Button/Button';
import Input from '../components/UI/Input/Input';
import Modal from '../components/UI/Modal/Modal';
import Footer from '../components/Footer/Footer';

const BusinessDashboardPage = () => {
  const navigate = useNavigate();
  const { user, switchRole } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [business, setBusiness] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    price: '',
    dueDate: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    switchRole('business');
    loadBusinessData();
  }, [user]);

  const loadBusinessData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const { businessId: id } = await apiService.getBusinessIdByUserId(user.uid);
      setBusinessId(id);

      if (id) {
        const [businessData, tasksData] = await Promise.all([
          apiService.getBusinessDetails(id),
          apiService.getTasksByBusiness(id),
        ]);
        setBusiness(businessData);
        setTasks(tasksData || []);

        try {
          const { profilePictureUrl } = await apiService.getBusinessProfilePicture(id);
          setProfilePicture(profilePictureUrl);
        } catch (error) {
          console.log('No profile picture found');
        }
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!createForm.name.trim()) {
      setErrors({ name: 'Task name is required' });
      return;
    }
    if (!createForm.description.trim()) {
      setErrors({ description: 'Description is required' });
      return;
    }
    if (!createForm.price || parseFloat(createForm.price) <= 0) {
      setErrors({ price: 'Valid price is required' });
      return;
    }
    if (!createForm.dueDate) {
      setErrors({ dueDate: 'Due date is required' });
      return;
    }

    setCreateLoading(true);
    try {
      const taskData = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        price: parseFloat(createForm.price),
        dueDate: createForm.dueDate,
        dateCreated: new Date().toISOString(),
        status: 'pending',
        isAssigned: false,
        assignedTo: null,
        businessId: businessId,
      };

      const response = await apiService.createTask(taskData);
      await loadBusinessData();
      
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', price: '', dueDate: '' });
      
      if (response.taskId) {
        navigate(`/business/task/${response.taskId}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setErrors({ submit: error.response?.data?.error || 'Failed to create task' });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleTaskClick = (taskId) => {
    navigate(`/business/task/${taskId}`);
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
    });
  };

  const filteredTasks = tasks.filter(task => 
    task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => normalizeStatus(t.status) === 'pending').length,
    assigned: tasks.filter(t => normalizeStatus(t.status) === 'assigned').length,
    inProgress: tasks.filter(t => normalizeStatus(t.status) === 'in_progress').length,
    submitted: tasks.filter(t => {
      const s = normalizeStatus(t.status);
      return s === 'submitted' || s === 'reviewed';
    }).length,
    approved: tasks.filter(t => normalizeStatus(t.status) === 'approved').length,
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
      width: '80px',
      height: '80px',
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
    statsCard: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: isDark 
        ? '0 2px 12px rgba(0, 0, 0, 0.3)' 
        : '0 2px 12px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    statsTitle: {
      fontSize: '20px',
      fontWeight: 600,
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: '20px',
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      borderBottom: `1px solid ${isDark ? '#2C2C2E' : '#E8E8E8'}`,
    },
    statItemLast: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      borderBottom: 'none',
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
    actionsBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      gap: '16px',
      flexWrap: 'wrap',
    },
    searchInput: {
      width: '320px',
      height: '44px',
      padding: '0 16px 0 48px',
      fontSize: '15px',
      fontFamily: 'inherit',
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
      borderRadius: '12px',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      outline: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    searchContainer: {
      position: 'relative',
    },
    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '18px',
      color: isDark ? '#ABABAB' : '#6B6B6B',
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
        .search-input:focus {
          border-color: ${isDark ? '#FFB84D' : '#FF6B35'} !important;
          box-shadow: 0 0 0 3px ${isDark 
            ? 'rgba(255, 184, 77, 0.1)' 
            : 'rgba(255, 107, 53, 0.1)'} !important;
        }
        .dashboard-container {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .dashboard-container {
            grid-template-columns: 1fr !important;
          }
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
        <div style={styles.container} className="animate-fade-in-up dashboard-container">
          <div style={styles.mainContent}>
            {/* Profile Header */}
            <div style={styles.profileHeader} className="apple-card">
              <img
                src={profilePicture || `https://ui-avatars.com/api/?name=${business?.businessName}`}
                alt={business?.businessName || 'Business'}
                style={styles.avatar}
              />
              <div style={styles.profileInfo}>
                <h1 style={styles.profileName} className="heading-1">
                  {business?.businessName || 'Business Dashboard'}
                </h1>
                <p style={styles.profileDescription} className="body-regular">
                  {business?.companyDescription || 'Manage your tasks and grow your business'}
                </p>
              </div>
              <div style={styles.editButton}>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/profile/edit')}
                >
                  ✎ Edit Profile
                </Button>
              </div>
            </div>

            {/* Actions Bar */}
            <div style={styles.actionsBar}>
            <div style={styles.searchContainer}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
                className="search-input"
              />
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Task
            </Button>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📋</div>
              <h2 style={styles.emptyTitle} className="heading-2">
                {searchQuery ? 'No tasks found' : 'No tasks yet'}
              </h2>
              <p style={styles.emptyText} className="body-regular">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first task to get started'}
              </p>
              {!searchQuery && (
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create First Task
                </Button>
              )}
            </div>
          ) : (
            <div style={styles.tasksGrid} className="tasks-grid">
              {filteredTasks.map((task) => {
                const normalizedStatus = normalizeStatus(task.status);
                const statusColor = getStatusColor(normalizedStatus);
                return (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task.id)}
                    style={{
                      ...styles.taskCard,
                      borderTopColor: statusColor,
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
                  </div>
                );
              })}
            </div>
          )}
          </div>

          {/* Stats Sidebar */}
          <div style={styles.statsSidebar}>
            <div style={styles.statsCard} className="apple-card">
              <h2 style={styles.statsTitle}>Statistics</h2>
              <div style={styles.statItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: isDark ? '#ABABAB' : '#6B6B6B' }}>
                  <span>📋</span>
                  <span>Given Tasks</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: isDark ? '#FFB84D' : '#FF6B35' }}>
                  {stats.total}
                </div>
              </div>
              <div style={styles.statItemLast}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: isDark ? '#ABABAB' : '#6B6B6B' }}>
                  <span>✓</span>
                  <span>Finished Tasks</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: isDark ? '#FFB84D' : '#FF6B35' }}>
                  {stats.approved}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Task Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Task"
        >
          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Input
              label="Task Name"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              error={errors.name}
              required
            />
            <Input
              label="Description"
              type="textarea"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              error={errors.description}
              required
            />
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              min="0"
              value={createForm.price}
              onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
              error={errors.price}
              required
            />
            <Input
              label="Due Date"
              type="datetime-local"
              value={createForm.dueDate}
              onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              error={errors.dueDate}
              required
            />
            {errors.submit && (
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                border: `1.5px solid ${isDark ? '#FF453A' : '#FF3B30'}`,
                background: isDark ? 'rgba(255, 69, 58, 0.1)' : 'rgba(255, 59, 48, 0.1)',
              }}>
                <p style={{ fontSize: '14px', color: isDark ? '#FF453A' : '#FF3B30' }}>
                  {errors.submit}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={createLoading}
                style={{ flex: 1 }}
              >
                Create Task
              </Button>
            </div>
          </form>
        </Modal>

        <Footer />
      </div>
    </>
  );
};

export default BusinessDashboardPage;
