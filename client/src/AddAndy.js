import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddAndy = () => {
  const [formData, setFormData] = useState({
    aka: '',
    bio: '',
    locationCity: '',
    locationState: '',
    locationCountry: '',
    jobTitle: '',
    company: '',
    yearsOfExperience: '',
    linkedinUrl: '',
    personalWebsiteUrl: '',
    contactEmail: ''
  });
  const [message, setMessage] = useState('');

  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/add-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Andy added successfully!');
        setFormData({
          aka: '', bio: '', locationCity: '', locationState: '', locationCountry: '',
          jobTitle: '', company: '', yearsOfExperience: '', linkedinUrl: '', personalWebsiteUrl: '', contactEmail: ''
        });
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error adding Andy:', error);
      setMessage('An error occurred while adding Andy.');
    }
  };

  const handleCancel = () => {
    navigate('/'); // Navigate back to the home page
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h2>Add an Andy Profile</h2>
      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'auto 1fr', alignItems: 'center' }}>
        <label style={{ textAlign: 'right' }}>AKA</label>
        <input type="text" name="aka" value={formData.aka} onChange={handleChange} />
        
        <label style={{ textAlign: 'right' }}>Bio</label>
        <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3"></textarea>
        
        <label style={{ textAlign: 'right' }}>City</label>
        <input type="text" name="locationCity" value={formData.locationCity} onChange={handleChange} />
        
        <label style={{ textAlign: 'right' }}>State</label>
        <input type="text" name="locationState" value={formData.locationState} onChange={handleChange} />
        
        <label style={{ textAlign: 'right' }}>Country</label>
        <input type="text" name="locationCountry" value={formData.locationCountry} onChange={handleChange} />
        
        <label style={{ textAlign: 'right' }}>Job Title</label>
        <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} />
        
        <label style={{ textAlign: 'right' }}>Company</label>
        <input type="text" name="company" value={formData.company} onChange={handleChange} />
        
        <label style={{ textAlign: 'right' }}>Years of Experience</label>
        <input type="text" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} />
        
        <label style={{ textAlign: 'right' }}>LinkedIn URL</label>
        <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} />
        
        <label style={{ textAlign: 'right' }}>Personal Website URL</label>
        <input type="url" name="personalWebsiteUrl" value={formData.personalWebsiteUrl} onChange={handleChange} />
        
        <label style={{ textAlign: 'right' }}>Contact Email</label>
        <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} />
        
        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}>Add Andy</button>
          <button type="button" onClick={handleCancel} style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddAndy;