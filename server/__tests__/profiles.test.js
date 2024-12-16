const { addProfile, getLocations, getTitles, getProfiles, deleteProfile } = require('../managers/profile');
const { createTestProfileData } = require('../testData/profileData');
const db = require('../db');

describe('Profile Manager Tests', () => {
  let testProfileId;

  afterAll(async () => {
    await db.end();
  });

  afterEach(async () => {
    if (testProfileId) {
      await deleteProfile(testProfileId);
      testProfileId = null;
    }
  });

  test('should add a new profile successfully', async () => {
    const profileData = createTestProfileData();
    testProfileId = await addProfile(profileData);

    expect(testProfileId).toBeDefined();

    const [rows] = await db.query('SELECT * FROM profile WHERE profile_id = ?', [testProfileId]);
    expect(rows.length).toBe(1);
    expect(rows[0].first_name).toBe(profileData.firstName);
  });

  test('should fetch unique locations', async () => {
    testProfileId = await addProfile(
      createTestProfileData({ locationCity: 'Unique City', locationState: 'UC', locationCountry: 'Uniqueland' })
    );

    const locations = await getLocations();
    expect(locations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          city: 'Unique City',
          state: 'UC',
          country: 'Uniqueland',
        }),
      ])
    );
  });
});