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

module.exports = router;
