import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  style = {},
  ...props 
}) => {
  const { isDark } = useTheme();

  // Map variants to Apple design system classes
  const variantClassMap = {
    primary: 'apple-button-primary',
    secondary: 'apple-button-secondary',
    text: 'apple-button-text',
    danger: 'apple-button-danger',
  };

  const sizeClassMap = {
    small: { padding: '10px 20px', fontSize: '14px' },
    medium: { padding: '14px 28px', fontSize: '16px' },
    large: { padding: '16px 32px', fontSize: '18px' },
  };

  // Fallback inline styles (if CSS doesn't load)
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    borderRadius: '12px',
    ...sizeClassMap[size],
  };

  const variantStyles = {
    primary: {
      background: isDark ? 'linear-gradient(135deg, #FFB84D, #FFA726)' : 'linear-gradient(135deg, #FF6B35, #FF5722)',
      color: '#ffffff',
      boxShadow: isDark ? '0 4px 16px rgba(255, 184, 77, 0.3)' : '0 4px 16px rgba(255, 107, 53, 0.3)',
    },
    secondary: {
      background: 'transparent',
      border: `2px solid ${isDark ? '#FFB84D' : '#FF6B35'}`,
      color: isDark ? '#FFB84D' : '#FF6B35',
    },
    text: {
      background: 'transparent',
      color: isDark ? '#FFB84D' : '#FF6B35',
      padding: '10px 20px',
    },
    danger: {
      background: isDark ? '#FF453A' : '#FF3B30',
      color: '#ffffff',
    },
  };

  const buttonStyle = {
    ...baseStyle,
    ...variantStyles[variant],
    ...style,
  };

  const combinedClassName = `apple-button ${variantClassMap[variant] || ''} ${className}`.trim();

  return (
    <button
      type={type}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClassName}
      {...props}
    >
      {loading && (
        <span className="apple-spinner" style={{ marginRight: '12px' }} />
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;
