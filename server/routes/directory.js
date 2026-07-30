const express = require('express');
const db = require('../db');

const router = express.Router();

// Public, unauthenticated: powers the home page stats and tickers.
// Only ever aggregates from verified accounts' own public fields --
// never touches the private `leads` list.
router.get('/directory', async (req, res, next) => {
  try {
    const [[{ verifiedCount }]] = await db.query(
      "SELECT COUNT(*) AS verifiedCount FROM accounts WHERE membership_status = 'verified'"
    );
    const [[{ countryCount }]] = await db.query(
      `SELECT COUNT(DISTINCT p.current_country) AS countryCount
       FROM profile p JOIN accounts a ON a.account_id = p.account_id
       WHERE a.membership_status = 'verified' AND p.current_country IS NOT NULL AND p.current_country != ''`
    );
    const [cityRows] = await db.query(
      `SELECT DISTINCT p.current_city AS city, p.current_country AS country
       FROM profile p JOIN accounts a ON a.account_id = p.account_id
       WHERE a.membership_status = 'verified' AND p.current_city IS NOT NULL AND p.current_city != ''
       LIMIT 20`
    );
    const [skillRows] = await db.query(
      "SELECT DISTINCT name FROM tags WHERE category = 'skill' LIMIT 20"
    );
    const [hobbyRows] = await db.query(
      "SELECT DISTINCT name FROM tags WHERE category = 'hobby' LIMIT 20"
    );

    res.json({
      verifiedCount,
      countryCount,
      cities: cityRows.map((r) => (r.country ? `${r.city}, ${r.country}` : r.city)),
      skills: skillRows.map((r) => r.name),
      hobbies: hobbyRows.map((r) => r.name),
    });
  } catch (err) {
    next(err);
  }
});

// Public, unauthenticated: the "findable" roster. Only accounts that chose
// search_participation = 'findable' ever appear here -- notify-only and
// invisible accounts are never listed, matching what those settings mean
// on the profile edit screen.
router.get('/directory/roster', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.profile_id, p.first_name, p.last_name, p.preferred_name, p.current_city, p.current_country
       FROM profile p
       JOIN accounts a ON a.account_id = p.account_id
       WHERE a.membership_status = 'verified' AND a.search_participation = 'findable'
       ORDER BY p.current_country, p.current_city`
    );
    res.json({ roster: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
