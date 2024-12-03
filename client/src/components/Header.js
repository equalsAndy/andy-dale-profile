import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Base API URL from environment variables
  const apiUrl = process.env.REACT_APP_API_URL;
  const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const auth0ClientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

  // Fetch the logged-in user's data and ensure their account exists
  useEffect(() => {
    const fetchAndEnsureAccount = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/user`, {
          credentials: 'include', // Include cookies for session
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
  
          // Ensure account exists for the logged-in user
          const email = userData._json?.email || userData.emails?.[0]?.value;
          if (email) {
            const ensureAccountResponse = await fetch(`${apiUrl}/api/ensure-account`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ email }),
            });
  
            if (!ensureAccountResponse.ok) {
              console.error('Failed to ensure account exists:', await ensureAccountResponse.text());
            }
          }
        } else {
          setUser(null); // Clear user state if not authenticated
        }
      } catch (error) {
        setUser(null); // Clear user state on error
        console.error('Error fetching user or ensuring account:', error);
      }
    };
  
    fetchAndEnsureAccount();
  }, [apiUrl]);

  const handleLogin = () => {
    const currentPath = window.location.pathname; // Get the current page path
    const loginUrl = `${apiUrl}/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl; // Redirect to login with returnTo query parameter
  };

  const handleLogout = async () => {
    const logoutUrl = `https://${auth0Domain}/v2/logout?client_id=${auth0ClientId}&returnTo=${encodeURIComponent(window.location.origin)}&federated`;

    try {
      // Attempt to clear the session on the server
      await fetch(`${apiUrl}/auth/logout`, {
        credentials: 'include',
        method: 'POST',
      });
    } catch (error) {
      console.error('Error during server logout:', error);
    } finally {
      // Always redirect to Auth0 logout, regardless of server logout result
      setUser(null); // Clear user state immediately
      window.location.href = logoutUrl;
    }
  };

  const handleMessageAdminClick = () => {
    navigate('/contact-admin');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* If user is authenticated, show their name and a Logout button */}
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={user.picture || '/default-avatar.png'}
                  alt={user.displayName || user.nickname || 'User'}
                  style={{ height: '30px', width: '30px', borderRadius: '50%' }}
                />
                <span>{user.displayName || user.nickname || user._json?.email || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
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
              Login
            </button>
          )}
          {location.pathname !== '/contact-admin' && (
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
      </div>
    </header>
  );
};

export default Header;