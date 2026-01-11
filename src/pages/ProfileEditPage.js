import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/UI/Button/Button';
import Input from '../components/UI/Input/Input';
import Modal from '../components/UI/Modal/Modal';
import Footer from '../components/Footer/Footer';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, currentRole } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [stats, setStats] = useState({
    availableTasks: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [updating, setUpdating] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfileData();
  }, [user, currentRole]);

  const loadProfileData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      let id = null;
      let profileData = null;

      if (currentRole === 'business') {
        const response = await apiService.getBusinessIdByUserId(user.uid);
        id = response.businessId;
        if (id) {
          profileData = await apiService.getBusinessDetails(id);
          const tasks = await apiService.getTasksByBusiness(id);
          calculateStats(tasks, 'business');
        }
      } else {
        const response = await apiService.getEmployeeIdByUserId(user.uid);
        id = response.employeeId;
        if (id) {
          profileData = await apiService.getEmployeeDetails(id);
          const [available, assigned] = await Promise.all([
            apiService.getUnassignedTasks(),
            apiService.getAssignedTasks(id),
          ]);
          calculateStats({ available, assigned }, 'employee');
        }
      }

      setProfileId(id);
      setProfile(profileData);

      if (id) {
        try {
          const pictureResponse = currentRole === 'business' 
            ? await apiService.getBusinessProfilePicture(id)
            : await apiService.getEmployeeProfilePicture(id);
          setProfilePicture(pictureResponse.profilePictureUrl);
        } catch (error) {
          console.log('No profile picture found');
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data, role) => {
    if (role === 'business') {
      const tasks = data || [];
      setStats({
        availableTasks: tasks.filter(t => normalizeStatus(t.status) === 'pending').length,
        assigned: tasks.filter(t => normalizeStatus(t.status) === 'assigned').length,
        inProgress: tasks.filter(t => normalizeStatus(t.status) === 'in_progress').length,
        completed: tasks.filter(t => ['submitted', 'reviewed', 'approved'].includes(normalizeStatus(t.status))).length,
      });
    } else {
      const available = data.available || [];
      const assigned = data.assigned || [];
      const inProgressTasks = assigned.filter(t => normalizeStatus(t.status) === 'in_progress');
      const completedTasks = assigned.filter(t => ['submitted', 'reviewed', 'approved'].includes(normalizeStatus(t.status)));
      
      setStats({
        availableTasks: available.length,
        assigned: assigned.length,
        inProgress: inProgressTasks.length,
        completed: completedTasks.length,
      });
    }
  };

  const normalizeStatus = (status) => {
    if (typeof status === 'string') return status;
    if (Array.isArray(status) && status.length > 0) {
      return status[status.length - 1].status || 'pending';
    }
    return 'pending';
  };

  const handleEditField = (field, currentValue) => {
    setEditingField(field);
    setEditValue(Array.isArray(currentValue) ? currentValue.join(', ') : currentValue || '');
  };

  const handleSaveField = async () => {
    if (!profileId || !editingField) return;

    setUpdating(true);
    try {
      const value = editValue.trim();
      if (currentRole === 'business') {
        await apiService.updateBusinessDetail(profileId, editingField, value);
      } else {
        await apiService.updateEmployeeDetails(profileId, editingField, value);
      }
      await loadProfileData();
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating field:', error);
      alert(error.response?.data?.error || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profileId) return;

    setUploading(true);
    try {
      if (currentRole === 'business') {
        await apiService.updateBusinessProfilePicture(profileId, file);
      } else {
        await apiService.updateEmployeeProfilePicture(profileId, file);
      }
      await loadProfileData();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const styles = {
    root: {
      minHeight: '100vh',
      background: isDark ? '#000000' : '#FAFAFA',
      padding: '40px 24px',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '40px',
      textAlign: 'center',
    },
    title: {
      fontSize: 'clamp(32px, 4vw, 44px)',
      fontWeight: 700,
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: '16px',
      letterSpacing: '-0.02em',
    },
    content: {
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: '32px',
    },
    profileCard: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: isDark 
        ? '0 2px 12px rgba(0, 0, 0, 0.3)' 
        : '0 2px 12px rgba(0, 0, 0, 0.06)',
    },
    avatarSection: {
      textAlign: 'center',
      marginBottom: '32px',
      position: 'relative',
      display: 'inline-block',
      width: '100%',
    },
    avatarContainer: {
      position: 'relative',
      display: 'inline-block',
      cursor: 'pointer',
      marginBottom: '16px',
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: `4px solid ${isDark ? '#FFB84D' : '#FF6B35'}`,
      objectFit: 'cover',
      boxShadow: isDark 
        ? '0 8px 24px rgba(255, 184, 77, 0.3)' 
        : '0 8px 24px rgba(255, 107, 53, 0.3)',
    },
    avatarOverlay: {
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontSize: '14px',
      opacity: avatarHover ? 1 : 0,
      transition: 'opacity 0.2s ease',
      cursor: 'pointer',
    },
    name: {
      fontSize: '28px',
      fontWeight: 600,
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: '8px',
    },
    description: {
      fontSize: '17px',
      color: isDark ? '#ABABAB' : '#6B6B6B',
      lineHeight: 1.6,
      marginBottom: '32px',
    },
    statsCard: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: isDark 
        ? '0 2px 12px rgba(0, 0, 0, 0.3)' 
        : '0 2px 12px rgba(0, 0, 0, 0.06)',
      height: 'fit-content',
      position: 'sticky',
      top: '100px',
    },
    statsTitle: {
      fontSize: '20px',
      fontWeight: 600,
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: '24px',
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      borderBottom: `1px solid ${isDark ? '#2C2C2E' : '#E8E8E8'}`,
    },
    statLabel: {
      fontSize: '15px',
      color: isDark ? '#ABABAB' : '#6B6B6B',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 700,
      color: isDark ? '#FFB84D' : '#FF6B35',
    },
    fieldRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: `1px solid ${isDark ? '#2C2C2E' : '#E8E8E8'}`,
      cursor: 'pointer',
      transition: 'background 0.2s ease',
    },
    fieldInfo: {
      flex: 1,
    },
    fieldLabel: {
      fontSize: '14px',
      fontWeight: 500,
      color: isDark ? '#ABABAB' : '#6B6B6B',
      marginBottom: '4px',
    },
    fieldValue: {
      fontSize: '16px',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
    },
    editIcon: {
      fontSize: '20px',
      color: isDark ? 'rgba(255, 184, 77, 0.5)' : 'rgba(255, 107, 53, 0.5)',
      transition: 'all 0.2s ease',
    },
    backButton: {
      marginBottom: '24px',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      background: isDark ? 'rgba(255, 184, 77, 0.1)' : 'rgba(255, 107, 53, 0.1)',
      color: isDark ? '#FFB84D' : '#FF6B35',
      fontSize: '15px',
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
  };

  if (loading) {
    return (
      <div style={styles.root}>
        <div style={{ ...styles.container, textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '18px', color: isDark ? '#FFFFFF' : '#1A1A1A' }}>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.root}>
        <div style={{ ...styles.container, textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '18px', color: isDark ? '#FFFFFF' : '#1A1A1A', marginBottom: '24px' }}>
            Profile not found
          </div>
          <Button onClick={() => navigate(currentRole === 'business' ? '/business/dashboard' : '/employee/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const displayName = profile.firstName && profile.lastName 
    ? `${profile.firstName} ${profile.lastName}`
    : profile.name || 'Kaushik A R';
  const displayDescription = profile.aboutEmployee || profile.aboutBusiness || profile.description || 'dssv df vd';

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <button
          onClick={() => navigate(currentRole === 'business' ? '/business/dashboard' : '/employee/dashboard')}
          style={styles.backButton}
          onMouseEnter={(e) => {
            e.target.style.background = isDark 
              ? 'rgba(255, 184, 77, 0.15)' 
              : 'rgba(255, 107, 53, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = isDark 
              ? 'rgba(255, 184, 77, 0.1)' 
              : 'rgba(255, 107, 53, 0.1)';
          }}
        >
          ← Back to Dashboard
        </button>

        <div style={styles.content}>
          <div style={styles.profileCard}>
            <div style={styles.avatarSection}>
              <div
                style={styles.avatarContainer}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=120&background=${isDark ? 'FFB84D' : 'FF6B35'}&color=fff`}
                  alt="Profile"
                  style={styles.avatar}
                />
                <div style={styles.avatarOverlay}>
                  <span style={{ fontSize: '32px', marginBottom: '8px' }}>📷</span>
                  <span>Change Photo</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              {uploading && (
                <div style={{ fontSize: '14px', color: isDark ? '#ABABAB' : '#6B6B6B', marginTop: '8px' }}>
                  Uploading...
                </div>
              )}
            </div>

            <h1 style={styles.name}>{displayName}</h1>
            <p style={styles.description}>{displayDescription}</p>

            <div>
              <div
                style={styles.fieldRow}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark 
                    ? 'rgba(255, 184, 77, 0.03)' 
                    : 'rgba(255, 107, 53, 0.03)';
                  e.currentTarget.querySelector('[data-edit-icon]').style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.querySelector('[data-edit-icon]').style.opacity = '0.5';
                }}
                onClick={() => handleEditField('name', displayName)}
              >
                <div style={styles.fieldInfo}>
                  <div style={styles.fieldLabel}>Full Name</div>
                  <div style={styles.fieldValue}>{displayName}</div>
                </div>
                <span data-edit-icon style={{ ...styles.editIcon, opacity: 0.5 }}>✏️</span>
              </div>

              <div
                style={styles.fieldRow}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark 
                    ? 'rgba(255, 184, 77, 0.03)' 
                    : 'rgba(255, 107, 53, 0.03)';
                  e.currentTarget.querySelector('[data-edit-icon]').style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.querySelector('[data-edit-icon]').style.opacity = '0.5';
                }}
                onClick={() => handleEditField(currentRole === 'business' ? 'aboutBusiness' : 'aboutEmployee', displayDescription)}
              >
                <div style={styles.fieldInfo}>
                  <div style={styles.fieldLabel}>Description</div>
                  <div style={styles.fieldValue}>{displayDescription}</div>
                </div>
                <span data-edit-icon style={{ ...styles.editIcon, opacity: 0.5 }}>✏️</span>
              </div>
            </div>
          </div>

          <div style={styles.statsCard}>
            <h2 style={styles.statsTitle}>Statistics</h2>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>
                <span>🔍</span>
                <span>Available Tasks</span>
              </div>
              <div style={styles.statValue}>{stats.availableTasks}</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>
                <span>📋</span>
                <span>Assigned</span>
              </div>
              <div style={styles.statValue}>{stats.assigned}</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>
                <span>🔄</span>
                <span>In Progress</span>
              </div>
              <div style={styles.statValue}>{stats.inProgress}</div>
            </div>
            <div style={{ ...styles.statItem, borderBottom: 'none' }}>
              <div style={styles.statLabel}>
                <span>✓</span>
                <span>Completed</span>
              </div>
              <div style={styles.statValue}>{stats.completed}</div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={editingField !== null}
          onClose={() => {
            setEditingField(null);
            setEditValue('');
          }}
          title={`Edit ${editingField === 'name' ? 'Name' : 'Description'}`}
        >
          <Input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={`Enter ${editingField === 'name' ? 'name' : 'description'}`}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setEditingField(null);
                setEditValue('');
              }}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveField}
              disabled={updating || !editValue.trim()}
              style={{ flex: 1 }}
            >
              {updating ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileEditPage;

