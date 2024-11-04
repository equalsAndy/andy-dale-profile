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
    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '24px' }}>
      <p>Andy lives in:</p>
      <p><strong>{city}, {state}, {country}</strong></p>
    </div>
  );
};

export default AndyLocations;