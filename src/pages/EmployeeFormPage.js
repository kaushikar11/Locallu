import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/UI/Button/Button';
import Input from '../components/UI/Input/Input';
import ImageUpload from '../components/UI/ImageUpload/ImageUpload';
import TagInput from '../components/UI/TagInput/TagInput';
import Footer from '../components/Footer/Footer';

const EmployeeFormPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    skills: [],
    paymentInfo: '',
    purpose: '',
    location: [],
    contactInfo: [],
    githubLink: '',
    previousJobs: '',
    qualifications: '',
    aboutEmployee: '',
    employeeImage: null,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleImageChange = (file) => {
    setFormData(prev => ({ ...prev, employeeImage: file }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.paymentInfo.trim()) newErrors.paymentInfo = 'Payment info is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const employeeData = {
        ...formData,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || `${formData.firstName} ${formData.lastName}`,
        photoURL: user.photoURL,
        skills: Array.isArray(formData.skills) ? formData.skills : [],
        location: Array.isArray(formData.location) ? formData.location : [],
        contactInfo: Array.isArray(formData.contactInfo) ? formData.contactInfo : [],
      };

      delete employeeData.employeeImage;

      const response = await apiService.createEmployee(employeeData);
      const employeeId = response.id;

      if (formData.employeeImage && employeeId) {
        await apiService.uploadEmployeeImage(employeeId, formData.employeeImage);
      }

      navigate('/employee/dashboard');
    } catch (error) {
      console.error('Error creating employee:', error);
      setErrors({ submit: error.response?.data?.error || 'Failed to create employee. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const pageStyles = {
    root: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: isDark ? '#000000' : '#FAFAFA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
    },
    container: {
      flex: 1,
      maxWidth: '800px',
      width: '100%',
      margin: '0 auto',
      padding: '80px clamp(24px, 5vw, 40px)',
    },
    card: {
      background: isDark ? '#1C1C1E' : '#FFFFFF',
      padding: '48px',
      borderRadius: '24px',
      boxShadow: isDark 
        ? '0 2px 16px rgba(0, 0, 0, 0.6)' 
        : '0 2px 16px rgba(0, 0, 0, 0.06)',
    },
    sectionHeader: {
      marginBottom: '32px',
    },
    title: {
      fontSize: 'clamp(24px, 3vw, 30px)',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      marginBottom: '8px',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
    },
    subtitle: {
      fontSize: '17px',
      lineHeight: 1.5,
      color: isDark ? '#ABABAB' : '#6B6B6B',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    twoColumn: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
    },
    errorBox: {
      padding: '16px',
      borderRadius: '12px',
      border: `1.5px solid ${isDark ? '#FF453A' : '#FF3B30'}`,
      background: isDark ? 'rgba(255, 69, 58, 0.1)' : 'rgba(255, 59, 48, 0.1)',
    },
    errorText: {
      fontSize: '14px',
      color: isDark ? '#FF453A' : '#FF3B30',
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '48px',
      paddingTop: '24px',
      borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
    },
  };

  return (
    <div style={pageStyles.root}>
      <div style={pageStyles.container}>
        <div style={pageStyles.card} className="apple-card">
          <div style={pageStyles.sectionHeader}>
            <h1 style={pageStyles.title} className="heading-2">
              Create Your Employee Profile
            </h1>
            <p style={pageStyles.subtitle} className="body-regular">
              Fill in your details to start finding opportunities
            </p>
          </div>
          
          <form onSubmit={handleSubmit} style={pageStyles.form}>
            <div style={pageStyles.twoColumn}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                error={errors.firstName}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                error={errors.lastName}
                required
              />
            </div>

            <TagInput
              label="Skills"
              value={formData.skills}
              onChange={(tags) => handleInputChange('skills', tags)}
              placeholder="e.g., JavaScript, Python, React"
            />

            <Input
              label="Payment Information"
              value={formData.paymentInfo}
              onChange={(e) => handleInputChange('paymentInfo', e.target.value)}
              error={errors.paymentInfo}
              required
            />

            <Input
              label="Purpose"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              placeholder="Why are you looking for work?"
            />

            <TagInput
              label="Location"
              value={formData.location}
              onChange={(tags) => handleInputChange('location', tags)}
              placeholder="e.g., New York, USA"
            />

            <TagInput
              label="Contact Information"
              value={formData.contactInfo}
              onChange={(tags) => handleInputChange('contactInfo', tags)}
              placeholder="e.g., +1-234-567-8900, contact@example.com"
            />

            <Input
              label="GitHub Link"
              type="url"
              value={formData.githubLink}
              onChange={(e) => handleInputChange('githubLink', e.target.value)}
              placeholder="https://github.com/username"
            />

            <Input
              label="Previous Jobs"
              type="textarea"
              value={formData.previousJobs}
              onChange={(e) => handleInputChange('previousJobs', e.target.value)}
              placeholder="Describe your previous work experience"
            />

            <Input
              label="Qualifications"
              type="textarea"
              value={formData.qualifications}
              onChange={(e) => handleInputChange('qualifications', e.target.value)}
              placeholder="List your qualifications and certifications"
            />

            <Input
              label="About Employee"
              type="textarea"
              value={formData.aboutEmployee}
              onChange={(e) => handleInputChange('aboutEmployee', e.target.value)}
              placeholder="Tell us about yourself"
            />

            <ImageUpload
              label="Profile Image"
              value={formData.employeeImage}
              onChange={handleImageChange}
            />

            {errors.submit && (
              <div style={pageStyles.errorBox}>
                <p style={pageStyles.errorText}>{errors.submit}</p>
              </div>
            )}

            <div style={pageStyles.actions}>
              <div />
              <Button
                type="submit"
                variant="primary"
                size="medium"
                loading={loading}
                style={{ minWidth: '200px' }}
              >
                {loading ? 'Saving...' : 'Create Employee Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EmployeeFormPage;
