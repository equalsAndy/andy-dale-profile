import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AddAndy from './AddAndy';
import AndyLocations from './components/AndyLocations';

function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to Andy Dale Profiles</h1>

      <AndyLocations /> {/* Add the scrolling location component here */}
      
      <p>Explore the many skills and talents of people named Andy Dale.</p>
      <Link to="/add-andy">
        <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Add an Andy Profile
        </button>
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-andy" element={<AddAndy />} />
      </Routes>
    </Router>
  );
}

export default App;