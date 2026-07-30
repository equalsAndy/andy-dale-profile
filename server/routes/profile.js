const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const BASIC_FIELDS = `
  p.profile_id, p.account_id, p.first_name, p.last_name, p.preferred_name,
  p.bio, p.photo_url, p.current_city, p.current_country,
  p.origin_story, p.claims_to_fame
`;

const DETAIL_FIELDS = `
  d.hometown_city, d.hometown_country, d.birth_year,
  d.current_job_title, d.current_employer,
  d.linkedin_url, d.personal_website_url, d.languages_spoken
`;

const loadFunFactsAndTags = async (profileId) => {
  const [funFacts] = await db.query(
    'SELECT fact_id, type, description FROM fun_facts WHERE profile_id = ?',
    [profileId]
  );
  const [tags] = await db.query(
    `SELECT t.category, t.name FROM profile_tags pt
     JOIN tags t ON t.tag_id = pt.tag_id WHERE pt.profile_id = ?`,
    [profileId]
  );
  return { funFacts, tags };
};

// Public-ish profile view: basic fields for anyone, detail fields only if
// the viewer is a verified account. Viewer may be logged out entirely.
router.get('/profiles/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT ${BASIC_FIELDS}, a.membership_status, a.comms_visibility
       FROM profile p
       JOIN accounts a ON a.account_id = p.account_id
       WHERE p.profile_id = ?`,
      [req.params.id]
    );
    const profile = rows[0];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const viewerVerified = req.account?.membership_status === 'verified';
    const isSelf = req.account?.account_id === profile.account_id;

    let detail = null;
    if (viewerVerified || isSelf) {
      const [detailRows] = await db.query(
        `SELECT ${DETAIL_FIELDS} FROM profile_detail d WHERE d.profile_id = ?`,
        [profile.profile_id]
      );
      detail = detailRows[0] || null;
    }

    const canMessage =
      !isSelf &&
      !!req.account &&
      (profile.comms_visibility === 'public' || viewerVerified);

    const { funFacts, tags } = await loadFunFactsAndTags(profile.profile_id);

    const { membership_status, comms_visibility, ...basic } = profile;
    res.json({
      ...basic,
      isVerified: membership_status === 'verified',
      canMessage,
      detail,
      funFacts,
      tags,
    });
  } catch (err) {
    next(err);
  }
});

// Own profile: always full detail, plus the account-level privacy settings
// that live on `accounts` (comms_visibility, search_participation, notification_mode).
router.get('/profile/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT ${BASIC_FIELDS} FROM profile p WHERE p.account_id = ?`,
      [req.account.account_id]
    );
    const profile = rows[0];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const [detailRows] = await db.query(
      `SELECT ${DETAIL_FIELDS} FROM profile_detail d WHERE d.profile_id = ?`,
      [profile.profile_id]
    );
    const { funFacts, tags } = await loadFunFactsAndTags(profile.profile_id);

    res.json({
      ...profile,
      detail: detailRows[0] || null,
      funFacts,
      tags,
      commsVisibility: req.account.comms_visibility,
      searchParticipation: req.account.search_participation,
      notificationMode: req.account.notification_mode,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/profile/me', requireAuth, async (req, res, next) => {
  const {
    preferredName, bio, photoUrl, currentCity, currentCountry, originStory, claimsToFame,
    hometownCity, hometownCountry, birthYear, currentJobTitle, currentEmployer,
    linkedinUrl, personalWebsiteUrl, languagesSpoken,
    commsVisibility, searchParticipation, notificationMode,
  } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [profileRows] = await conn.query('SELECT profile_id FROM profile WHERE account_id = ?', [
      req.account.account_id,
    ]);
    const profileId = profileRows[0]?.profile_id;
    if (!profileId) throw new Error('Profile not found for this account');

    await conn.query(
      `UPDATE profile SET preferred_name = ?, bio = ?, photo_url = ?, current_city = ?,
         current_country = ?, origin_story = ?, claims_to_fame = ?
       WHERE profile_id = ?`,
      [preferredName, bio, photoUrl, currentCity, currentCountry, originStory, claimsToFame, profileId]
    );

    await conn.query(
      `INSERT INTO profile_detail
         (profile_id, hometown_city, hometown_country, birth_year, current_job_title,
          current_employer, linkedin_url, personal_website_url, languages_spoken)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         hometown_city = VALUES(hometown_city), hometown_country = VALUES(hometown_country),
         birth_year = VALUES(birth_year), current_job_title = VALUES(current_job_title),
         current_employer = VALUES(current_employer), linkedin_url = VALUES(linkedin_url),
         personal_website_url = VALUES(personal_website_url), languages_spoken = VALUES(languages_spoken)`,
      [profileId, hometownCity, hometownCountry, birthYear, currentJobTitle, currentEmployer,
        linkedinUrl, personalWebsiteUrl, languagesSpoken]
    );

    if (commsVisibility || searchParticipation || notificationMode) {
      await conn.query(
        `UPDATE accounts SET
           comms_visibility = COALESCE(?, comms_visibility),
           search_participation = COALESCE(?, search_participation),
           notification_mode = COALESCE(?, notification_mode)
         WHERE account_id = ?`,
        [commsVisibility || null, searchParticipation || null, notificationMode || null, req.account.account_id]
      );
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;
