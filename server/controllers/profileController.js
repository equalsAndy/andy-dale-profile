const profileManager = require('../managers/profile');

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

module.exports = {
  addProfile,
  getLocations,
  getTitles,
  getProfiles,
};