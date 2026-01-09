import React, { useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
  };

  const modalStyle = {
    maxWidth: '672px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '12px',
    border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    background: isDark ? '#1f2937' : '#ffffff',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    borderBottom: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 700,
    color: isDark ? '#ffffff' : '#111827',
  };

  const closeButtonStyle = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: isDark ? '#9ca3af' : '#6b7280',
    fontSize: '24px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  };

  const bodyStyle = {
    padding: '24px',
  };

  return (
    <>
      <style>{`
        .ui-modal-close:hover {
          background: ${isDark ? '#374151' : '#f3f4f6'} !important;
          color: ${isDark ? '#ffffff' : '#111827'} !important;
        }
      `}</style>
      <div 
        style={overlayStyle}
        onClick={onClose}
      >
        <div 
          style={modalStyle}
          className={className}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div style={headerStyle}>
              <h2 style={titleStyle}>{title}</h2>
              <button
                onClick={onClose}
                style={closeButtonStyle}
                className="ui-modal-close"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}
          <div style={bodyStyle}>{children}</div>
        </div>
      </div>
    </>
  );
};

export default Modal;
