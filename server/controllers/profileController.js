const db = require('../db');
const profileManager = require('../managers/profile');
const emailManager = require('../managers/email');

// Function to add a new Andy profile
const addProfile = async (req, res) => {
  const {
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
  } = req.body;

  const firstName = 'Andy';
  const lastName = 'Dale';

  try {
    const profileId = await profileManager.addProfile({
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
    });
    res.status(201).json({ message: 'Andy added successfully', profileId });
  } catch (err) {
    console.error('Error adding Andy to the database:', err);
    res.status(500).json({ message: 'Error adding Andy to the database' });
  }
};

// Function to get unique cities, states, and countries of all Andys
const getLocations = async (req, res) => {
  try {
    const locations = await profileManager.getLocations();
    res.json(locations);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).send('Error fetching locations');
  }
};

// Function to get unique job titles of all Andys
const getTitles = async (req, res) => {
  try {
    const titles = await profileManager.getTitles();
    res.json(titles);
  } catch (err) {
    console.error('Error fetching titles:', err);
    res.status(500).send('Error fetching titles');
  }
};

// Function to get all Andy profiles
const getProfiles = async (req, res) => {
  try {
    const profiles = await profileManager.getProfiles();
    res.json(profiles);
  } catch (err) {
    console.error('Error fetching Andy profiles:', err);
    res.status(500).send('Error fetching Andy profiles');
  }
};

// ...existing code...

// Function to get a profile by ID
const getProfileById = async (req, res) => {
  const { id } = req.body; // Extract ID from the request body

  if (!id) {
    return res.status(400).send('ID is required'); // Handle missing ID
  }

  try {
    const profile = await profileManager.getProfileById(id);
    if (profile) {
      res.json(profile); // Send the profile as JSON
    } else {
      res.status(404).send('Profile not found'); // Handle non-existent profile
    }
  } catch (err) {
    console.error(`Error fetching profile with ID ${id}:`, err);
    res.status(500).send('Error fetching profile'); // Handle server error
  }
};



const updateProfileAndEmail = async (req, res) => {
  const connection = await db.getConnection(); // Get a transaction-safe connection
  try {
    await connection.beginTransaction();

    const { profileId, email, ...profileData } = req.body;

    // Update profile
    await profileManager.updateProfile(profileId, profileData, connection);

    // Update primary email if provided
    if (email) {
      await emailManager.updatePrimaryEmail(profileId, email, connection);
    }

    await connection.commit();
    res.status(200).json({ message: 'Profile and email updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating profile or email:', error);
    res.status(500).json({ message: 'Failed to update profile or email' });
  } finally {
    connection.release();
  }
};

module.exports = {
  addProfile,
  getLocations,
  getTitles,
  getProfiles,
  getProfileById, // Add the new function to the exports
  updateProfileAndEmail,
};