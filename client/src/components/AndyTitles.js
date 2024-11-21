import React, { useEffect, useState } from 'react';

const AndyTitles = () => {
  const [titles, setTitles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const response = await fetch('http://andydale.me/api/titles');
        const data = await response.json();
        setTitles(data);
      } catch (error) {
        console.error('Error fetching titles:', error);
      }
    };

    fetchTitles();
  }, []);

  useEffect(() => {
    if (titles.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % titles.length);
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [titles]);

  if (titles.length === 0) {
    return <p>Loading titles...</p>;
  }

  const { job_title } = titles[currentIndex];

  return (
    <div style={{ position: 'relative', textAlign: 'right', marginTop: '20px', padding: '40px', color: 'black', fontSize: '24px' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/good_job.png")', // Optional background
          backgroundSize: '40%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.1,
          zIndex: -1,
        }}
      />
      <p style={{textAlign:'center'}}>Andy Dale's title is a:</p>
      <p style={{textAlign:'center'}}><strong>{job_title}</strong></p>
    </div>
  );
};

export default AndyTitles;