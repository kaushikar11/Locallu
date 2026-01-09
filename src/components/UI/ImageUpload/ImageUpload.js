import React, { useRef, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const ImageUpload = ({ label, value, onChange, accept = 'image/*', maxSize = 5 }) => {
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (file && file.size <= maxSize * 1024 * 1024) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const containerStyle = {
    border: `2px dashed ${dragActive 
      ? (isDark ? '#FFB84D' : '#FF6B35')
      : (isDark ? '#2C2C2E' : '#E8E8E8')}`,
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    cursor: 'pointer',
    background: dragActive
      ? (isDark ? 'rgba(255, 184, 77, 0.03)' : 'rgba(255, 107, 53, 0.03)')
      : 'transparent',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const iconStyle = {
    fontSize: '48px',
    color: isDark ? '#FFB84D' : '#FF6B35',
    marginBottom: '16px',
  };

  const textStyle = {
    fontSize: '15px',
    fontWeight: 500,
    color: isDark ? '#ABABAB' : '#6B6B6B',
    marginBottom: '8px',
  };

  const subtextStyle = {
    fontSize: '13px',
    color: isDark ? '#6B6B6B' : '#9B9B9B',
  };

  const previewStyle = {
    maxWidth: '200px',
    borderRadius: '12px',
    marginBottom: '16px',
  };

  const changeButtonStyle = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: isDark ? '#FFB84D' : '#FF6B35',
    background: 'transparent',
    border: `1.5px solid ${isDark ? '#FFB84D' : '#FF6B35'}`,
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div>
      {label && (
        <label style={{
          fontSize: '14px',
          fontWeight: 500,
          color: isDark ? '#FFFFFF' : '#1A1A1A',
          marginBottom: '8px',
          display: 'block',
        }}>
          {label}
        </label>
      )}
      <div
        style={containerStyle}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (!preview) {
            e.currentTarget.style.borderColor = isDark ? '#FFB84D' : '#FF6B35';
            e.currentTarget.style.background = isDark 
              ? 'rgba(255, 184, 77, 0.03)' 
              : 'rgba(255, 107, 53, 0.03)';
          }
        }}
        onMouseLeave={(e) => {
          if (!preview && !dragActive) {
            e.currentTarget.style.borderColor = isDark ? '#2C2C2E' : '#E8E8E8';
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        {preview || value ? (
          <div>
            <img 
              src={preview || (typeof value === 'string' ? value : URL.createObjectURL(value))} 
              alt="Preview" 
              style={previewStyle}
            />
            <button
              type="button"
              onClick={handleRemove}
              style={changeButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = isDark 
                  ? 'rgba(255, 184, 77, 0.1)' 
                  : 'rgba(255, 107, 53, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Change Image
            </button>
          </div>
        ) : (
          <>
            <div style={iconStyle}>📷</div>
            <p style={textStyle}>Click to upload or drag and drop</p>
            <p style={subtextStyle}>PNG, JPG up to {maxSize}MB</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;

