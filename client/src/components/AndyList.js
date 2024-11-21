import React, { useEffect, useState } from 'react';
import {  Link } from 'react-router-dom';

const AndyList = () => {
  const [andys, setAndys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAndys, setFilteredAndys] = useState([]);

  useEffect(() => {
    // Fetch all Andy profiles
    const fetchAndys = async () => {
      try {
        const response = await fetch('http://andydale.me/api/andys');
        const data = await response.json();
        setAndys(data);
        setFilteredAndys(data); // Initially display all Andys
      } catch (error) {
        console.error('Error fetching Andy profiles:', error);
      }
    };

    fetchAndys();
  }, []);

  useEffect(() => {
    // Filter the list of Andys based on the search term
    const results = andys.filter((andy) =>
      `${andy.first_name} ${andy.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (andy.job_title && andy.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (andy.location_city && andy.location_city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (andy.location_state && andy.location_state.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (andy.location_country && andy.location_country.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredAndys(results);
  }, [searchTerm, andys]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      
      <Link to="/" >
        <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position:"absolute", top:'50px', left:'100px' }}>
           Home
        </button>
      </Link>

      <h2>List of Andy Profiles</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name, location, or job title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '10px', fontSize: '16px', width: '80%', marginBottom: '20px' }}
      />

      {/* Andy List Table */}
      <table style={{ width: '80%', margin: '0 auto', borderCollapse: 'collapse', fontSize: '18px' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Name</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Job Title</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Company</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Location</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndys.length > 0 ? (
            filteredAndys.map((andy) => (
              <tr key={andy.user_id} style={{ textAlign: 'left' }}>
                <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>
                  {andy.first_name} {andy.last_name}
                </td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>
                  {andy.job_title || 'Not specified'}
                </td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>
                  {andy.company || 'Not specified'}
                </td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>
                  {andy.location_city && andy.location_state && andy.location_country
                    ? `${andy.location_city}, ${andy.location_state}, ${andy.location_country}`
                    : 'Not specified'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ padding: '10px' }}>No results found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AndyList;