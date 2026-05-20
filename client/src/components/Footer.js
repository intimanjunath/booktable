import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <p>© 2025 BookTable. All rights reserved.</p>
    </footer>
  );
};

const footerStyle = {
  textAlign: 'center',
  padding: '15px',
  backgroundColor: '#f2f2f2',
  borderTop: '1px solid #ddd',
};

export default Footer;
