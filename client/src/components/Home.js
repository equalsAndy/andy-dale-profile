import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AndyLocations from './AndyLocations';
import AndyFunFacts from './AndyFunFacts';
import AndyTitles from './AndyTitles';
import InfoModal from './InfoModal';
import '../styles/Home.css'; // Import the CSS file

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
    <div className="container">
    

      {/* Flex container for Locations and Titles */}
      <div className="flex-container">
        {/* Locations Block */}
        <div className="block block-left">
          <AndyLocations />
        </div>
         {/* Fun Facts Block */}
      <div className="block block-center">
        <AndyFunFacts />
      </div>

        {/* Titles Block */}
        <div className="block block-right">
          <AndyTitles />
        </div>
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
