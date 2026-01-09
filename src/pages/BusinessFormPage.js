import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/UI/Button/Button';
import Input from '../components/UI/Input/Input';
import Card from '../components/UI/Card/Card';
import ImageUpload from '../components/UI/ImageUpload/ImageUpload';
import TagInput from '../components/UI/TagInput/TagInput';
import Footer from '../components/Footer/Footer';

const BusinessFormPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    businessName: '',
    paymentInfo: '',
    productPurpose: '',
    industry: [],
    location: [],
    contactInfo: [],
    websiteURL: '',
    companyDescription: '',
    businessImage: null,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleImageChange = (file) => {
    setFormData(prev => ({ ...prev, businessImage: file }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.paymentInfo.trim()) newErrors.paymentInfo = 'Payment info is required';
    if (!formData.companyDescription.trim()) newErrors.companyDescription = 'Company description is required';
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
      const businessData = {
        ...formData,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        industry: Array.isArray(formData.industry) ? formData.industry : [],
        location: Array.isArray(formData.location) ? formData.location : [],
        contactInfo: Array.isArray(formData.contactInfo) ? formData.contactInfo : [],
      };

      delete businessData.businessImage;

      const response = await apiService.createBusiness(businessData);
      const businessId = response.id;

      if (formData.businessImage && businessId) {
        await apiService.uploadBusinessImage(businessId, formData.businessImage);
      }

      navigate('/business/dashboard');
    } catch (error) {
      console.error('Error creating business:', error);
      setErrors({ submit: error.response?.data?.error || 'Failed to create business. Please try again.' });
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
    backButton: {
      padding: '14px 28px',
      background: 'transparent',
      border: `1.5px solid ${isDark ? '#2C2C2E' : '#E8E8E8'}`,
      color: isDark ? '#ABABAB' : '#6B6B6B',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
    },
  };

  return (
    <div style={pageStyles.root}>
      <div style={pageStyles.container}>
        <div style={pageStyles.card} className="apple-card">
          <div style={pageStyles.sectionHeader}>
            <h1 style={pageStyles.title} className="heading-2">
              Create Your Business Profile
            </h1>
            <p style={pageStyles.subtitle} className="body-regular">
              Fill in your business details to get started
            </p>
          </div>
          
          <form onSubmit={handleSubmit} style={pageStyles.form}>
            <Input
              label="Business Name"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              error={errors.businessName}
              required
            />

            <Input
              label="Company Description"
              type="textarea"
              value={formData.companyDescription}
              onChange={(e) => handleInputChange('companyDescription', e.target.value)}
              error={errors.companyDescription}
              required
            />

            <Input
              label="Payment Information"
              value={formData.paymentInfo}
              onChange={(e) => handleInputChange('paymentInfo', e.target.value)}
              error={errors.paymentInfo}
              required
            />

            <Input
              label="Product Purpose"
              value={formData.productPurpose}
              onChange={(e) => handleInputChange('productPurpose', e.target.value)}
            />

            <TagInput
              label="Industry"
              value={formData.industry}
              onChange={(tags) => handleInputChange('industry', tags)}
              placeholder="e.g., Technology, Finance, Healthcare"
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
              label="Website URL"
              type="url"
              value={formData.websiteURL}
              onChange={(e) => handleInputChange('websiteURL', e.target.value)}
              placeholder="https://example.com"
            />

            <ImageUpload
              label="Business Image"
              value={formData.businessImage}
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
                {loading ? 'Saving...' : 'Create Business Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessFormPage;
