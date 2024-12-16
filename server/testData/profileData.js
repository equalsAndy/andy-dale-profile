const { v4: uuidv4 } = require('uuid'); // For unique values

// Shared test profile data
const testProfileData = {
  firstName: 'Andy',
  lastName: 'Test',
  aka: 'Test Andy',
  bio: 'Testing profile table',
  locationCity: 'Test City',
  locationState: 'TS',
  locationCountry: 'Testland',
  jobTitle: 'Tester',
  company: 'Test Co.',
  yearsOfExperience: '5',
  linkedinUrl: 'https://linkedin.com/in/testandy',
  personalWebsiteUrl: 'https://testandy.com',
  contactEmail: `testandy-${Date.now()}@example.com`, // Unique by timestamp
};

// Utility function to generate unique test profiles
const createTestProfileData = (overrides = {}) => {
  const uniqueData = { contactEmail: `testandy-${uuidv4()}@example.com` };
  return { ...testProfileData, ...uniqueData, ...overrides };
};

module.exports = {
  testProfileData,
  createTestProfileData,
};