import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import AppRoutes from './routes';

const apiUrl = process.env.REACT_APP_API_URL;

function App() {
  const [user, setUser] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/user`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  return (
    <Router>
      <Header ref={headerRef} user={user} />
      <div style={{ paddingTop: `${headerHeight}px` }}>
        <AppRoutes user={user} setUser={setUser} />
      </div>
    </Router>
  );
}

export default App;