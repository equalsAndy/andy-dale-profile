import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import AddAndy from './AddAndy';
import AndyLocations from './components/AndyLocations';
import AndyTitles from './components/AndyTitles';
import AndyList from './components/AndyList';
import InfoModal from './components/InfoModal'; // Import the InfoModal component
import Header from './components/Header'; // Import the Header component
import ContactAdmin from './components/ContactAdmin'; // Import the ContactAdmin page

function Home() {
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleViewAllAndysClick = () => {
    setShowModal(true); // Show the modal when button is clicked
  };

  const handleModalConfirm = () => {
    setShowModal(false); // Hide the modal
    navigate('/andy-list'); // Navigate to /andy-list
  };

  const handleModalClose = () => {
    setShowModal(false); // Close the modal without navigating
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to Andy Dale</h1>

      {/* Locations Block */}
      <div style={{ width: '66.6%', marginLeft: '20px', textAlign: 'left' }}>
        <AndyLocations />
      </div>

      {/* Titles Block, offset to the right */}
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
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginLeft: '10px' }}
      >
        View All Andys
      </button>

      {/* Show Modal if Active */}
      {showModal && <InfoModal onClose={handleModalClose} onConfirm={handleModalConfirm} />}
    </div>
  );
}


function App() {
  return (
    <Router>
      <Header /> {/* Add the Header component */}
      <div style={{ paddingTop: '70px' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-andy" element={<AddAndy />} />
        <Route path="/andy-list" element={<AndyList />} />
        <Route path="/contact-admin" element={<ContactAdmin />} /> 
      </Routes>
      </div>
    </Router>
  );
}

export default App;