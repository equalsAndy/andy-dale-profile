const { addProfile, getLocations, getTitles, getProfiles, getProfileById, deleteProfile } = require('../managers/profile');
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

  test('should fetch unique job titles', async () => {
    const jobTitle = 'Test Job Title';
    testProfileId = await addProfile(createTestProfileData({ jobTitle }));

    const titles = await getTitles();
    expect(titles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          job_title: jobTitle,
        }),
      ])
    );
  });

  test('should fetch all Andy profiles', async () => {
    const profileData = createTestProfileData({ firstName: 'Andy', lastName: 'Test' });
    testProfileId = await addProfile(profileData);

    const profiles = await getProfiles();
    expect(profiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          first_name: 'Andy',
          last_name: 'Test',
        }),
      ])
    );
  });

  test('should fetch a profile by ID', async () => {
    const profileData = createTestProfileData();
    testProfileId = await addProfile(profileData);

    const profile = await getProfileById(testProfileId);
    expect(profile).toBeDefined();
    expect(profile.first_name).toBe(profileData.firstName);
    expect(profile.last_name).toBe(profileData.lastName);
  });

  test('should return null for non-existent profile ID', async () => {
    const profile = await getProfileById(999999); // Use an ID that doesn't exist
    expect(profile).toBeUndefined();
  });
});