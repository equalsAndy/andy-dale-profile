const db = require('../db');
const {
  getFunFacts,
  addFunFact,
  deleteFunFact,
  getFunFactsByProfileId,
} = require('../controllers/funFactController');
const funFactManager = require('../managers/funFact');
const profileManager = require('../managers/profile');
const { createTestFunFactData } = require('../testData/funFactData');
const { createTestProfileData } = require('../testData/profileData');

describe('Fun Fact Controller Tests', () => {
  let testFunFactId;
  let testProfileId;

  afterAll(async () => {
    await db.end();
  });

  afterEach(async () => {
    if (testFunFactId) {
      await funFactManager.deleteFunFact(testFunFactId);
      testFunFactId = null;
    }
    if (testProfileId) {
      await profileManager.deleteProfile(testProfileId);
      testProfileId = null;
    }
  });

  // Test: Get all fun facts
  test('getFunFacts should return all fun facts', async () => {
    const req = {};
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      send: jest.fn(),
    };

    await getFunFacts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(Array.isArray(res.json.mock.calls[0][0])).toBe(true); // Verify returned data is an array
  });

  // Test: Add a new fun fact
  test('addFunFact should create a new fun fact', async () => {
    const profileData = createTestProfileData(); // Create a test profile
    testProfileId = await profileManager.addProfile(profileData);

    const funFactData = createTestFunFactData(); // Create a test fun fact
    const req = {
      body: {
        profileId: testProfileId,
        type: funFactData.type,
        description: funFactData.description,
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      send: jest.fn(),
    };

    await addFunFact(req, res);

    expect(res.status).toHaveBeenCalledWith(201); // Expect created status
    expect(res.json).toHaveBeenCalled();
    const newFunFact = res.json.mock.calls[0][0];
    expect(newFunFact).toHaveProperty('id'); // Ensure ID is returned
    testFunFactId = newFunFact.id; // Save for cleanup
  });

  // Test: Delete an existing fun fact
  test('deleteFunFact should delete an existing fun fact', async () => {
    const profileData = createTestProfileData();
    testProfileId = await profileManager.addProfile(profileData);

    const funFactData = createTestFunFactData();
    testFunFactId = await funFactManager.addFunFact(
      testProfileId,
      funFactData.type,
      funFactData.description
    );

    const req = { body: { factId: testFunFactId } }; // Provide valid factId
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      send: jest.fn(),
    };

    await deleteFunFact(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Fun fact deleted successfully.' });
  });

  // Test: Get fun facts by profile ID
  test('getFunFactsByProfileId should return fun facts for a specific profile', async () => {
    const profileData = createTestProfileData();
    testProfileId = await profileManager.addProfile(profileData);

    const funFactData = createTestFunFactData();
    await funFactManager.addFunFact(
      testProfileId,
      funFactData.type,
      funFactData.description
    );

    const req = { body: { profileId: testProfileId } }; // Send profileId in body for POST
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      send: jest.fn(),
    };

    await getFunFactsByProfileId(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    const returnedFacts = res.json.mock.calls[0][0];
    expect(Array.isArray(returnedFacts)).toBe(true);
    expect(returnedFacts.length).toBeGreaterThan(0);
  });
});