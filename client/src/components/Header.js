import React, { useState, useEffect, forwardRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Header.css'; // Import the CSS file

const Header = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const auth0ClientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

  useEffect(() => {
    const fetchAndEnsureAccount = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/user`, {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);

          if (userData.user) {
            const ensureAccountResponse = await fetch(`${apiUrl}/api/ensure-account`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(userData.user),
            });

            if (!ensureAccountResponse.ok) {
              console.error('Failed to ensure account exists:', await ensureAccountResponse.text());
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
        console.error('Error fetching user or ensuring account:', error);
      }
    };

    fetchAndEnsureAccount();
  }, [apiUrl]);

  const handleLogin = () => {
    const currentPath = window.location.pathname;
    const loginUrl = `${apiUrl}/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
  };

  const handleLogout = async () => {
    const logoutUrl = `https://${auth0Domain}/v2/logout?client_id=${auth0ClientId}&returnTo=${encodeURIComponent(window.location.origin)}&federated`;

    try {
      await fetch(`${apiUrl}/auth/logout`, {
        credentials: 'include',
        method: 'POST',
      });
    } catch (error) {
      console.error('Error during server logout:', error);
    } finally {
      setUser(null);
      window.location.href = logoutUrl;
    }
  };

  const handleMessageAdminClick = () => {
    navigate('/contact-admin');
  };

  return (
    <header className="header" ref={ref}>
      <div className="header-container">
        <h1 className="header-title">
          <Link to="/" className="header-link">
            Andy Dale Project
          </Link>
        </h1>
        <div className="header-actions">
          {user ? (
            <>
              <div className="header-user-info" style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={user.picture || '/default-avatar.png'}
                  alt={user.displayName || user.nickname || 'User'}
                  className="header-avatar"
                  style={{ width: '24px', height: '24px', marginRight: '8px' }}
                />
                <span className="header-username">
                  {user.displayName || user.nickname || user._json?.email || 'User'}
                </span>
              </div>
              <button className="header-button logout-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="header-button login-button" onClick={handleLogin}>
              Login
            </button>
          )}
          {location.pathname !== '/contact-admin' && (
            <button className="header-button admin-button" onClick={handleMessageAdminClick}>
              Message Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
});

export default Header;