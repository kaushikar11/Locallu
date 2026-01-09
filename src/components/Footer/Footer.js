import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();
  const currentYear = new Date().getFullYear();

  const styles = {
    footer: {
      position: 'relative',
      zIndex: 10,
      borderTop: `2px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
      background: isDark ? '#111827' : '#ffffff',
      padding: '32px 0',
      marginTop: 'auto',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 16px',
    },
    topSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '24px',
    },
    copyright: {
      fontSize: '14px',
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    companyName: {
      fontWeight: 600,
      color: '#f97316',
    },
    authorName: {
      fontWeight: 600,
      color: isDark ? '#d1d5db' : '#374151',
    },
    links: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      flexWrap: 'wrap',
    },
    link: {
      fontSize: '14px',
      color: isDark ? '#9ca3af' : '#6b7280',
      textDecoration: 'none',
      transition: 'color 0.2s',
      cursor: 'pointer',
    },
    linkHover: {
      color: '#f97316',
    },
    bottomSection: {
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
      textAlign: 'center',
    },
    tagline: {
      fontSize: '12px',
      color: isDark ? '#6b7280' : '#9ca3af',
    },
  };

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .footer-top-section {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
        }
      `}</style>
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.topSection} className="footer-top-section">
          <div style={styles.copyright}>
            <p>
              © {currentYear} <span style={styles.companyName}>Locallu</span>. All rights reserved.
            </p>
            <p style={{ marginTop: '4px' }}>
              Built by <span style={styles.authorName}>Kaushik</span>
            </p>
          </div>
          <div style={styles.links}>
            <a 
              href="#" 
              style={styles.link}
              onMouseEnter={(e) => e.target.style.color = styles.linkHover.color}
              onMouseLeave={(e) => e.target.style.color = styles.link.color}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              style={styles.link}
              onMouseEnter={(e) => e.target.style.color = styles.linkHover.color}
              onMouseLeave={(e) => e.target.style.color = styles.link.color}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              style={styles.link}
              onMouseEnter={(e) => e.target.style.color = styles.linkHover.color}
              onMouseLeave={(e) => e.target.style.color = styles.link.color}
            >
              Contact
            </a>
          </div>
        </div>
        <div style={styles.bottomSection}>
          <p style={styles.tagline}>
            Locallu - The World's First AI Employer | Connecting talent with opportunity
          </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
