const { v4: uuidv4 } = require('uuid'); // For unique values

// Shared test user data
const testUserData = {
  username: `testuser-${Date.now()}`, // Unique by timestamp
  passwordHash: 'hashedpassword', // Mocked hash
  isAdmin: 0,
  verified: 0,
};

// Utility function to generate unique test users
const createTestUserData = (overrides = {}) => {
  const uniqueData = { username: `testuser-${uuidv4()}` };
  return { ...testUserData, ...uniqueData, ...overrides };
};

module.exports = {
  testUserData,
  createTestUserData,
};