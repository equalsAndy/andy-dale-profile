import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import AddAndy from './AddAndy';
import AndyLocations from './components/AndyLocations';
import AndyTitles from './components/AndyTitles';
import AndyList from './components/AndyList';
import InfoModal from './components/InfoModal'; // Import the InfoModal component
import Header from './components/Header'; // Import the Header component
import ContactAdmin from './components/ContactAdmin'; // Import the ContactAdmin page

const apiUrl = process.env.REACT_APP_API_URL;

function Home({ user }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleViewAllAndysClick = () => {
    setShowModal(true);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    navigate('/andy-list');
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {/* Logo and Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px', // Adds spacing between logo and text
        }}
      >
        <img
          src="/andydale.me.png"
          alt="Andy Dale Logo"
          style={{ maxWidth: '60px' }}
        />
        <h1 style={{ margin: 0 }}>Welcome to Andy Dale</h1>
      </div>

      {/* Locations Block */}
      <div style={{ width: '66.6%', marginLeft: '20px', textAlign: 'left' }}>
        <AndyLocations />
      </div>

      {/* Titles Block */}
      <div style={{ width: '66.6%', marginLeft: '340px', textAlign: 'right' }}>
        <AndyTitles />
      </div>

      <p>Explore the many skills and talents of people named Andy Dale.</p>
      <Link to="/add-andy" hidden={true}>
        <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Add an Andy Profile
        </button>
      </Link>
      <button
        onClick={handleViewAllAndysClick}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          marginLeft: '10px',
        }}
      >
        View All Andys
      </button>

      {showModal && <InfoModal onClose={handleModalClose} onConfirm={handleModalConfirm} />}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/user`, {
          credentials: 'include', // Include cookies for session
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

  return (
    <Router>
      <Header user={user} /> {/* Pass user as a prop to Header */}
      <div style={{ paddingTop: '70px' }}>
        <Routes>
          <Route path="/" element={<Home user={user} />} /> {/* Pass user to Home */}
          <Route path="/add-andy" element={<AddAndy />} />
          <Route path="/andy-list" element={<AndyList user={user} setUser={setUser} />} />
          <Route path="/contact-admin" element={<ContactAdmin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;