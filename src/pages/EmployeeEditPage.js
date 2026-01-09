import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/UI/Button/Button';
import Input from '../components/UI/Input/Input';
import Modal from '../components/UI/Modal/Modal';
import Footer from '../components/Footer/Footer';

const EmployeeEditPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [updating, setUpdating] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadEmployee();
  }, [user]);

  const loadEmployee = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const { employeeId: id } = await apiService.getEmployeeIdByUserId(user.uid);
      setEmployeeId(id);

      if (id) {
        const employeeData = await apiService.getEmployeeDetails(id);
        setEmployee(employeeData);
        
        try {
          const { profilePictureUrl } = await apiService.getEmployeeProfilePicture(id);
          setProfilePicture(profilePictureUrl);
        } catch (error) {
          console.log('No profile picture found');
        }
      }
    } catch (error) {
      console.error('Error loading employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (field, currentValue) => {
    setEditingField(field);
    setEditValue(Array.isArray(currentValue) ? currentValue.join(', ') : currentValue || '');
  };

  const handleSaveField = async () => {
    if (!employeeId || !editingField) return;

    setUpdating(true);
    try {
      const value = editValue.trim();
      await apiService.updateEmployeeDetails(employeeId, editingField, value);
      await loadEmployee();
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
    if (!file || !employeeId) return;

    setUploading(true);
    try {
      await apiService.updateEmployeeProfilePicture(employeeId, file);
      await loadEmployee();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Organize fields into sections
  const organizeFields = (employee) => {
    if (!employee) return {};
    
    const sections = {
      personal: ['firstName', 'lastName', 'aboutEmployee'],
      professional: ['skills', 'qualifications', 'previousJobs', 'purpose'],
      contact: ['location', 'contactInfo', 'githubLink'],
      payment: ['paymentInfo'],
    };

    const organized = {};
    Object.entries(employee).forEach(([key, value]) => {
      if (['uid', 'email', 'photoURL', 'employeeImage'].includes(key)) return;
      
      let section = 'other';
      for (const [sectionName, fields] of Object.entries(sections)) {
        if (fields.includes(key)) {
          section = sectionName;
          break;
        }
      }
      
      if (!organized[section]) organized[section] = [];
      organized[section].push({ key, value });
    });

    return organized;
  };

  const sectionTitles = {
    personal: 'Personal Information',
    professional: 'Professional Details',
    contact: 'Contact & Links',
    payment: 'Payment Information',
    other: 'Additional Information',
  };

  const sectionIcons = {
    personal: '👤',
    professional: '💼',
    contact: '📍',
    payment: '💳',
    other: '📝',
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
      maxWidth: '1000px',
      width: '100%',
      margin: '0 auto',
      padding: '40px clamp(24px, 5vw, 48px)',
      flex: 1,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px',
      gap: '24px',
      flexWrap: 'wrap',
    },
    title: {
      fontSize: 'clamp(28px, 3.5vw, 36px)',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
    },
    saveButton: {
      position: 'sticky',
      top: '88px',
      zIndex: 100,
    },
    profileSection: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      padding: '32px',
      borderRadius: '20px',
      textAlign: 'center',
      marginBottom: '32px',
      boxShadow: isDark 
        ? '0 2px 12px rgba(0, 0, 0, 0.6)' 
        : '0 2px 12px rgba(0, 0, 0, 0.06)',
    },
    avatarContainer: {
      position: 'relative',
      display: 'inline-block',
      marginBottom: '20px',
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: `4px solid ${isDark ? '#FFB84D' : '#FF6B35'}`,
      boxShadow: isDark 
        ? '0 8px 24px rgba(255, 184, 77, 0.3)' 
        : '0 8px 24px rgba(255, 107, 53, 0.3)',
      objectFit: 'cover',
      transition: 'all 0.3s ease',
    },
    avatarOverlay: {
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      color: '#FFFFFF',
      fontSize: '32px',
      cursor: 'pointer',
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    sectionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
    },
    sectionCard: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      padding: '32px',
      borderRadius: '16px',
      boxShadow: isDark 
        ? '0 2px 12px rgba(0, 0, 0, 0.6)' 
        : '0 2px 12px rgba(0, 0, 0, 0.06)',
    },
    sectionHeader: {
      fontSize: 'clamp(20px, 2.5vw, 24px)',
      fontWeight: 600,
      color: isDark ? '#FFB84D' : '#FF6B35',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    sectionIcon: {
      fontSize: '24px',
    },
    fieldRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
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
  };

  if (loading) {
    return (
      <div style={{...styles.root, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{ fontSize: '18px', color: isDark ? '#FFFFFF' : '#1A1A1A' }}>Loading...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{...styles.root, alignItems: 'center', justifyContent: 'center'}}>
        <div style={styles.sectionCard} className="apple-card">
          <p style={{ textAlign: 'center', color: isDark ? '#ABABAB' : '#6B6B6B', marginBottom: '24px' }}>
            Employee profile not found.
          </p>
          <Button variant="primary" onClick={() => navigate('/employee/form')}>
            Create Profile
          </Button>
        </div>
      </div>
    );
  }

  const organizedFields = organizeFields(employee);

  return (
    <>
      <style>{`
        .avatar-container:hover .avatar-overlay {
          opacity: 1 !important;
        }
        .field-row:hover {
          background: ${isDark ? 'rgba(255, 184, 77, 0.03)' : 'rgba(255, 107, 53, 0.03)'} !important;
        }
        .field-row:hover .edit-icon {
          opacity: 1 !important;
          transform: scale(1.1) !important;
        }
        @media (max-width: 768px) {
          .sections-grid {
            grid-template-columns: 1fr !important;
          }
          .save-button-sticky {
            position: fixed !important;
            bottom: 24px !important;
            right: 24px !important;
            top: auto !important;
            z-index: 1000 !important;
            box-shadow: 0 8px 32px ${isDark ? 'rgba(255, 184, 77, 0.4)' : 'rgba(255, 107, 53, 0.4)'} !important;
          }
        }
      `}</style>
      <div style={styles.root}>
        <div style={styles.container} className="animate-fade-in-up">
          {/* Page Header */}
          <div style={styles.header}>
            <h1 style={styles.title} className="heading-1">
              Edit Profile
            </h1>
            <div style={styles.saveButton} className="save-button-sticky">
              <Button
                variant="primary"
                onClick={() => navigate('/employee/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Profile Picture Section */}
          <div style={styles.profileSection} className="apple-card">
            <div
              style={styles.avatarContainer}
              className="avatar-container"
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={profilePicture || `https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}`}
                alt="Profile"
                style={styles.avatar}
              />
              <div style={styles.avatarOverlay} className="avatar-overlay">
                <span>📷</span>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Change Photo</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
            >
              {profilePicture ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </div>

          {/* Sections Grid */}
          <div style={styles.sectionsGrid} className="sections-grid">
            {Object.entries(organizedFields).map(([sectionKey, fields]) => (
              <div key={sectionKey} style={styles.sectionCard} className="apple-card">
                <h2 style={styles.sectionHeader} className="heading-3">
                  <span style={styles.sectionIcon}>{sectionIcons[sectionKey] || '📝'}</span>
                  {sectionTitles[sectionKey] || sectionTitles.other}
                </h2>
                {fields.map(({ key, value }, index) => (
                  <div
                    key={key}
                    onClick={() => handleEditField(key, value)}
                    style={{
                      ...styles.fieldRow,
                      borderBottom: index === fields.length - 1 ? 'none' : styles.fieldRow.borderBottom,
                    }}
                    className="field-row"
                  >
                    <div style={styles.fieldInfo}>
                      <div style={styles.fieldLabel}>{formatLabel(key)}</div>
                      <div style={styles.fieldValue}>
                        {Array.isArray(value) ? value.join(', ') : value || 'Not set'}
                      </div>
                    </div>
                    <span style={styles.editIcon} className="edit-icon">✎</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editingField}
          onClose={() => {
            setEditingField(null);
            setEditValue('');
          }}
          title={`Edit ${formatLabel(editingField || '')}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Input
              label={formatLabel(editingField || '')}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              type={editingField === 'githubLink' ? 'url' : 'text'}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
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
                variant="primary"
                onClick={handleSaveField}
                loading={updating}
                style={{ flex: 1 }}
              >
                Save
              </Button>
            </div>
          </div>
        </Modal>

        <Footer />
      </div>
    </>
  );
};

export default EmployeeEditPage;
