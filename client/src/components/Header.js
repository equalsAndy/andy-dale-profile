import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

  const handleMessageAdminClick = () => {
    navigate('/contact-admin'); // Navigate to the contact admin page
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          paddingLeft: '40px',
          paddingRight: '40px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
            Andy Dale Project
          </Link>
        </h1>
        {location.pathname !== '/contact-admin' && ( // Suppress button on contact admin page
          <button
            onClick={handleMessageAdminClick}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Message Admin
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;