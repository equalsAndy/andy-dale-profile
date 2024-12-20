import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AndyLocations from './AndyLocations';
import AndyTitles from './AndyTitles';
import InfoModal from './InfoModal';

const Home = ({ user }) => {
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
};

export default Home;