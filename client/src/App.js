import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AddAndy from './AddAndy';
import AndyLocations from './components/AndyLocations';
import AndyTitles from './components/AndyTitles';
import AndyList from './components/AndyList';
import { detectIncognito } from 'detectincognitojs';



function Home() {

  const [alertShown, setAlertShown] = useState(false);

  useEffect(() => {
    if (!alertShown) {
      detectIncognito()
        .then((result) => {
          console.log("Browser:", result.browserName);
          console.log("Incognito Mode:", result.isPrivate);

          if (result.isPrivate) {
            alert("You are in incognito mode.");
          } else {
            alert("You are not in incognito mode.");
          }

          setAlertShown(true); // Prevent further alerts
        })
        .catch((error) => {
          console.error("Error detecting incognito mode:", error);
        });
    }
  }, [alertShown]);

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
      <Link to="/andy-list">
        <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginLeft: '10px' }}>
          View All Andys
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
        <Route path="/andy-list" element={<AndyList />} />
      </Routes>
    </Router>
  );
}

export default App;