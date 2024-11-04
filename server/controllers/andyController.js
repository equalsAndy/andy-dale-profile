const db = require('../db');

// Function to add a new Andy profile
const addAndy = (req, res) => {
    const {
      aka,
      bio,
      locationCity,
      locationState,  // New state field
      locationCountry,
      jobTitle,
      company,
      yearsOfExperience,
      linkedinUrl,
      personalWebsiteUrl,
      contactEmail
    } = req.body;
  
    const firstName = 'Andy';
    const lastName = 'Dale';
  
    const sql = `
      INSERT INTO users 
      (first_name, last_name, aka, bio, location_city, location_state, location_country, job_title, company, 
       years_of_experience, linkedin_url, personal_website_url, contact_email) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    db.query(sql, [
      firstName,
      lastName,
      aka,
      bio,
      locationCity,
      locationState,
      locationCountry,
      jobTitle,
      company,
      yearsOfExperience,
      linkedinUrl,
      personalWebsiteUrl,
      contactEmail
    ], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error adding Andy to the database' });
      }
      res.status(201).json({ message: 'Andy added successfully', userId: result.insertId });
    });
  };

// Function to get cities and countries of all Andys
const getLocations = (req, res) => {
    const sql = 'SELECT location_city AS city, location_state AS state, location_country AS country FROM users WHERE location_city IS NOT NULL AND location_country IS NOT NULL';
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching locations:', err);
        return res.status(500).send('Error fetching locations');
      }
      res.json(results);
    });
  };
  
  module.exports = {
    addAndy,
    getLocations // Export the new function
  };