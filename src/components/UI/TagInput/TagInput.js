import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const TagInput = ({ label, value = [], onChange, placeholder = 'Type and press Enter', required = false }) => {
  const { isDark } = useTheme();
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const containerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '12px 20px',
    minHeight: '52px',
    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    border: '1.5px solid transparent',
    borderRadius: '12px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const tagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: isDark ? 'rgba(255, 184, 77, 0.1)' : 'rgba(255, 107, 53, 0.1)',
    borderRadius: '8px',
    fontSize: '14px',
    color: isDark ? '#FFB84D' : '#FF6B35',
    fontWeight: 500,
  };

  const removeButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: 1,
    padding: 0,
    marginLeft: '4px',
    transition: 'all 0.2s ease',
  };

  const inputStyle = {
    flex: 1,
    minWidth: '120px',
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: isDark ? '#FFFFFF' : '#1A1A1A',
    outline: 'none',
    fontFamily: 'inherit',
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
          {required && <span style={{ color: isDark ? '#FF453A' : '#FF3B30', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <div
        style={containerStyle}
        onFocus={(e) => {
          e.currentTarget.style.background = isDark ? '#1C1C1E' : '#FFFFFF';
          e.currentTarget.style.borderColor = isDark ? '#FFB84D' : '#FF6B35';
          e.currentTarget.style.boxShadow = isDark 
            ? '0 0 0 4px rgba(255, 184, 77, 0.1)' 
            : '0 0 0 4px rgba(255, 107, 53, 0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {value.map((tag, index) => (
          <span key={index} style={tagStyle}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              style={removeButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = isDark 
                  ? 'rgba(255, 69, 58, 0.1)' 
                  : 'rgba(255, 59, 48, 0.1)';
                e.target.style.borderRadius = '4px';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          style={inputStyle}
        />
      </div>
      <p style={{
        fontSize: '13px',
        color: isDark ? '#6B6B6B' : '#9B9B9B',
        marginTop: '6px',
      }}>
        Press Enter to add a tag
      </p>
    </div>
  );
};

export default TagInput;

