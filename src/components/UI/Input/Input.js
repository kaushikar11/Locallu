import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  style = {},
  ...props
}) => {
  const { isDark } = useTheme();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const inputBaseStyle = {
    width: '100%',
    padding: '12px 20px',
    fontSize: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    color: isDark ? '#FFFFFF' : '#1A1A1A',
    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    border: `1.5px solid ${error 
      ? (isDark ? '#FF453A' : '#FF3B30') 
      : 'transparent'}`,
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const textareaStyle = {
    ...inputBaseStyle,
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: '"SF Mono", "Monaco", "Courier New", monospace',
  };

  const errorStyle = {
    fontSize: '14px',
    color: isDark ? '#FF453A' : '#FF3B30',
    marginTop: '4px',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: 500,
    color: isDark ? '#ABABAB' : '#6B6B6B',
    marginBottom: '8px',
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: isDark ? '#FF453A' : '#FF3B30', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          style={{ ...textareaStyle, ...style }}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`apple-input apple-textarea ${error ? 'apple-input-error' : ''} ${className}`}
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
          {...props}
        />
      ) : (
        <input
          type={type}
          style={{ ...inputBaseStyle, ...style }}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`apple-input ${error ? 'apple-input-error' : ''} ${className}`}
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
          {...props}
        />
      )}
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
};

export default Input;
