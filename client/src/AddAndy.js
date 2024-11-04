import React, { useState } from 'react';

const AddAndy = () => {
  const [formData, setFormData] = useState({
    aka: '',
    bio: '',
    locationCity: '',
    locationState: '',  // New state field
    locationCountry: '',
    jobTitle: '',
    company: '',
    yearsOfExperience: '',
    linkedinUrl: '',
    personalWebsiteUrl: '',
    contactEmail: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/add-andy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Andy added successfully!');
        setFormData({
          aka: '', bio: '', locationCity: '', locationState: '', locationCountry: '', jobTitle: '',
          company: '', yearsOfExperience: '', linkedinUrl: '', personalWebsiteUrl: '', contactEmail: ''
        });
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error adding Andy:', error);
      setMessage('An error occurred while adding Andy.');
    }
  };

  return (
    <div>
      <h2>Add an Andy Profile</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div><label>AKA</label><input type="text" name="aka" value={formData.aka} onChange={handleChange} /></div>
        <div><label>Bio</label><textarea name="bio" value={formData.bio} onChange={handleChange}></textarea></div>
        <div><label>City</label><input type="text" name="locationCity" value={formData.locationCity} onChange={handleChange} /></div>
        <div><label>State</label><input type="text" name="locationState" value={formData.locationState} onChange={handleChange} /></div>
        <div><label>Country</label><input type="text" name="locationCountry" value={formData.locationCountry} onChange={handleChange} /></div>
        <div><label>Job Title</label><input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} /></div>
        <div><label>Company</label><input type="text" name="company" value={formData.company} onChange={handleChange} /></div>
        <div><label>Years of Experience</label><input type="text" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} /></div>
        <div><label>LinkedIn URL</label><input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} /></div>
        <div><label>Personal Website URL</label><input type="url" name="personalWebsiteUrl" value={formData.personalWebsiteUrl} onChange={handleChange} /></div>
        <div><label>Contact Email</label><input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} /></div>
        <button type="submit">Add Andy</button>
      </form>
    </div>
  );
};

export default AddAndy;