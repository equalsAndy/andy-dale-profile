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


// Function to get unique cities, states, and countries of all Andys
const getLocations = (req, res) => {
    const sql = 'SELECT DISTINCT location_city AS city, location_state AS state, location_country AS country FROM users WHERE location_city IS NOT NULL AND location_country IS NOT NULL';
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching locations:', err);
        return res.status(500).send('Error fetching locations');
      }
      res.json(results);
    });
  };

  // Function to get unique cities, states, and countries of all Andys
const getTitles = (req, res) => {
    const sql = 'SELECT DISTINCT job_title FROM users WHERE job_title IS NOT NULL and job_title!=""';
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching titles:', err);
        return res.status(500).send('Error fetching titles');
      }
      res.json(results);
    });
  };
  
// Function to get all Andy profiles
const getAndys = (req, res) => {
  const sql = `
    SELECT 
      u.user_id, 
      u.first_name, 
      u.last_name, 
      u.job_title, 
      u.location_city, 
      u.location_state, 
      u.location_country, 
      u.company,
      CASE WHEN e.email_address IS NOT NULL THEN true ELSE false END AS has_email,
      e.allow_admin_contact,
      e.allow_andy_contact,
      e.allow_public_contact
    FROM users u
    LEFT JOIN emails e ON u.user_id = e.user_id AND e.is_primary = 1
    WHERE u.first_name = "Andy"
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching Andy profiles:', err);
      return res.status(500).send('Error fetching Andy profiles');
    }
    res.json(results);
  });
};
  
  module.exports = {
    addAndy,
    getLocations,
    getTitles,
    getAndys // Export the new function
  };