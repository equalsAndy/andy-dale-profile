const db = require('../db');
const { testProfileData, createTestProfileData } = require('../testData/profileData');

describe('Database Connection Tests', () => {
  let testProfileId;

  afterAll(async () => {
    await db.end();
  });

  afterEach(async () => {
    if (testProfileId) {
      await db.query('DELETE FROM profile WHERE profile_id = ?', [testProfileId]);
      testProfileId = null;
    }
  });

  test('should establish a connection to the database', async () => {
    const [rows] = await db.query('SELECT 1 AS result');
    expect(rows).toBeDefined();
    expect(rows[0].result).toBe(1);
  });

  test('should insert and fetch a profile', async () => {
    const insertSQL = `
      INSERT INTO profile 
      (first_name, last_name, aka, bio, location_city, location_state, location_country, job_title, company, years_of_experience, linkedin_url, personal_website_url, contact_email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const profileData = Object.values(testProfileData);

    const [result] = await db.query(insertSQL, profileData);
    testProfileId = result.insertId;

    expect(testProfileId).toBeDefined();

    const [rows] = await db.query('SELECT * FROM profile WHERE profile_id = ?', [testProfileId]);
    expect(rows.length).toBe(1);
    expect(rows[0].first_name).toBe(testProfileData.firstName);
  });
});