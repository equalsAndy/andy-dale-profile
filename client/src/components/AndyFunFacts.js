import React, { useEffect, useState } from 'react';

const AndyFunFacts = () => {
  const [funFacts, setFunFacts] = useState([]); // Updated variable name
  const [currentIndex, setCurrentIndex] = useState(0);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchFunFacts = async () => {
      try {
        const response = await fetch(apiUrl + '/api/funfacts'); // Endpoint for fun facts
        const data = await response.json();
        setFunFacts(data); // Set fun facts to state
      } catch (error) {
        console.error('Error fetching fun facts:', error);
      }
    };

    fetchFunFacts();
  }, [apiUrl]); // Include apiUrl in the dependency array

  useEffect(() => {
    if (funFacts.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % funFacts.length);
      }, 4200);

      return () => clearInterval(interval);
    }
  }, [funFacts]);

  if (funFacts.length === 0) {
    return <p>Loading fun facts...</p>; // Updated loading message
  }

  const { description, type } = funFacts[currentIndex]; // Assume fun facts have a 'description' field

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <div style={{ position: 'relative', textAlign: 'right', marginTop: '2px', padding: '4px', color: 'black', fontSize: '24px', backgroundColor:'lightblue', width:'70%', borderRadius:'15px' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/fun_background.png")', // Optional background for fun facts
            backgroundSize: '40%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.1,
            zIndex: -1,
          }}
          />
          <p style={{ textAlign: 'center' }}>
          {type === 'Fact' && 'A fun fact about Andy:'}
          {type === 'Quote' && "One of Andy's favorite Quotes:"}
          {type === 'Talent' && 'Andy can:'}
          </p>

          <p style={{ textAlign: 'center' }}>
          <strong>{description}</strong> {/* Display fun fact description */}
      </p>
    </div>
    </div>
  );
};

export default AndyFunFacts;