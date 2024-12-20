const db = require('../db');

// Add a new Andy profile
const addProfile = async ({
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
  contactEmail,
}) => {
  const sql = `
    INSERT INTO profile 
    (first_name, last_name, aka, bio, location_city, location_state, location_country, job_title, company, 
     years_of_experience, linkedin_url, personal_website_url, contact_email) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
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
    contactEmail,
  ]);

  return result.insertId;
};

// Get unique cities, states, and countries
const getLocations = async () => {
  const sql = `
    SELECT DISTINCT location_city AS city, location_state AS state, location_country AS country 
    FROM profile 
    WHERE location_city IS NOT NULL AND location_country IS NOT NULL
  `;
  const [results] = await db.query(sql);
  return results;
};

// Get unique job titles
const getTitles = async () => {
  const sql = `
    SELECT DISTINCT job_title 
    FROM profile 
    WHERE job_title IS NOT NULL AND job_title != ""
  `;
  const [results] = await db.query(sql);
  return results;
};

// Get all Andy profiles
const getProfiles = async () => {
  const sql = `
    SELECT 
      p.profile_id, 
      p.first_name, 
      p.last_name, 
      p.job_title, 
      p.location_city, 
      p.location_state, 
      p.location_country, 
      p.company,
      CASE WHEN e.email_address IS NOT NULL THEN true ELSE false END AS has_email,
      CASE WHEN a.verified = 1 THEN true ELSE false END AS isVerified,
      CASE WHEN a.account_id IS NOT NULL THEN true ELSE false END AS hasAccount,
      e.allow_admin_contact,
      e.allow_andy_contact,
      e.allow_public_contact,
      a.is_admin
    FROM profile p
    LEFT JOIN emails e ON p.profile_id = e.profile_id AND e.is_primary = 1
    LEFT JOIN accounts a ON p.profile_id = a.profile_id
    WHERE p.first_name = 'Andy';
  `;
  const [results] = await db.query(sql);
  return results;
};

// Delete a profile by ID
const deleteProfile = async (profileId) => {
  const sql = `DELETE FROM profile WHERE profile_id = ?`;
  await db.query(sql, [profileId]);
};

const getProfileById = async (id) => {
  try {
    const sql = 'SELECT * FROM profile WHERE profile_id = ?';
    const [rows] = await db.query(sql, [id]); // Use parameterized query
    return rows[0]; // Access `rows` as per the MySQL module's return structure
  } catch (err) {
    console.error(`Error fetching profile with ID ${id}:`, err);
    throw err;
  }
};

module.exports = {
  addProfile,
  getLocations,
  getTitles,
  getProfiles,
  getProfileById,
  deleteProfile
};