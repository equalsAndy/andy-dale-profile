const db = require('../db');
const { ensureAccountExists, claimProfile } = require('../controllers/userController');
const userManager = require('../managers/user');
const profileManager = require('../managers/profile');
const { createTestProfileData } = require('../testData/profileData');
const { createTestUserData } = require('../testData/userData');

describe('User Controller Tests', () => {
  let testProfileId;
  let testAccountId;
  let testEmailAddress;

  afterAll(async () => {
    await db.close();
  });

  afterEach(async () => {
    if (testAccountId) {
      await userManager.deleteAccount({ accountId: testAccountId }); // Use deleteAccount to clean up
      testAccountId = null;
    }
    if (testProfileId) {
      await profileManager.deleteProfile(testProfileId); // Delete test profile
      testProfileId = null;
    }
  });

  test('ensureAccountExists should create a new account', async () => {
    const userData = createTestUserData();
    testEmailAddress = userData.username;

    const req = { body: { email: testEmailAddress } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await ensureAccountExists(req, res);

    const account = await userManager.checkAccount(testEmailAddress);
    expect(account).toBeDefined();
    testAccountId = account.account_id; // Set for cleanup
  });

  test('claimProfile should link profile to account and create email record', async () => {
    const profileData = createTestProfileData();
    testProfileId = await profileManager.addProfile(profileData);

    const userData = createTestUserData();
    testAccountId = await userManager.addAccount(userData.username);

    const req = {
      body: {
        profileId: testProfileId,
        allowAndyContact: 'true',
        allowPublicContact: 'false',
      },
      user: { email: userData.username },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await claimProfile(req, res);

    const account = await userManager.checkAccount(userData.username);
    expect(account.profile_id).toBe(testProfileId);
  });
});