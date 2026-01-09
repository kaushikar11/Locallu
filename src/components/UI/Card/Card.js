import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const Card = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false,
  style = {},
  ...props 
}) => {
  const { isDark } = useTheme();

  const baseStyle = {
    background: isDark ? '#1C1C1E' : '#FFFFFF',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
    borderRadius: '16px',
    padding: '32px',
    boxShadow: isDark 
      ? '0 2px 12px rgba(0, 0, 0, 0.6)' 
      : '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  const hoverStyle = hoverable || onClick
    ? {
        cursor: 'pointer',
      }
    : {};

  return (
    <div 
      style={{ ...baseStyle, ...hoverStyle }}
      onClick={onClick}
      className={`apple-card ${hoverable || onClick ? 'apple-card-elevated' : ''} ${className}`}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = isDark 
            ? '0 8px 24px rgba(0, 0, 0, 0.7)' 
            : '0 4px 16px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.borderColor = isDark ? '#FFB84D' : '#FF6B35';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isDark 
            ? '0 2px 12px rgba(0, 0, 0, 0.6)' 
            : '0 2px 8px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.borderColor = isDark 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.06)';
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
