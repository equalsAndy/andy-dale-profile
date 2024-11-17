import React, { useEffect, useState } from 'react';

const AndyLocations = () => {
  const [locations, setLocations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/locations');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % locations.length);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [locations]);

  if (locations.length === 0) {
    return <p>Loading locations...</p>;
  }

  const { city, state, country } = locations[currentIndex];

  return (
    <div style={{ position: 'relative', textAlign: 'left', marginTop: '20px',padding:'40px', color: 'black', fontSize: '24px' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          textAlign:'center',
          backgroundImage: 'url("/world-map.png")',
          backgroundSize: '40%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.1, // Fades the background to 30%
          zIndex: -1,
        }}
      />
      <p style={{textAlign:'center'}}>Andy Dale lives in:</p>
      <p style={{textAlign:'center'}}><strong>{city}, {state}, {country}</strong></p>
    </div>
  );
};

export default AndyLocations;