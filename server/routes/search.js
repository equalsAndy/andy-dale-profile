const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const searchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  keyGenerator: (req) => String(req.account?.account_id || req.ip),
  message: { error: 'Too many searches, please try again later' },
});

router.post('/search', requireAuth, searchLimiter, async (req, res, next) => {
  const { school, hometownCity, currentCity, employer, birthYearFrom, birthYearTo, message } = req.body;

  const conditions = ['a.membership_status = \'verified\'', 'a.search_participation != \'invisible\'', 'p.account_id != ?'];
  const params = [req.account.account_id];

  if (school) {
    conditions.push(
      'EXISTS (SELECT 1 FROM profile_education pe WHERE pe.profile_id = p.profile_id AND pe.school_name LIKE ?)'
    );
    params.push(`%${school}%`);
  }
  if (hometownCity) {
    conditions.push('d.hometown_city LIKE ?');
    params.push(`%${hometownCity}%`);
  }
  if (currentCity) {
    conditions.push('p.current_city LIKE ?');
    params.push(`%${currentCity}%`);
  }
  if (employer) {
    conditions.push(
      `(d.current_employer LIKE ? OR EXISTS (
         SELECT 1 FROM profile_employment pe2 WHERE pe2.profile_id = p.profile_id AND pe2.employer_name LIKE ?
       ))`
    );
    params.push(`%${employer}%`, `%${employer}%`);
  }
  if (birthYearFrom) {
    conditions.push('d.birth_year >= ?');
    params.push(birthYearFrom);
  }
  if (birthYearTo) {
    conditions.push('d.birth_year <= ?');
    params.push(birthYearTo);
  }

  if (conditions.length === 3) {
    return res.status(400).json({ error: 'At least one search criterion is required' });
  }

  try {
    const [matches] = await db.query(
      `SELECT p.account_id, p.profile_id, p.first_name, p.last_name, p.preferred_name,
              p.current_city, p.current_country, a.search_participation
       FROM profile p
       JOIN accounts a ON a.account_id = p.account_id
       LEFT JOIN profile_detail d ON d.profile_id = p.profile_id
       WHERE ${conditions.join(' AND ')}`,
      params
    );

    const findableMatches = matches
      .filter((m) => m.search_participation === 'findable')
      .map(({ search_participation, ...rest }) => rest);

    const notifyOnlyMatches = matches.filter((m) => m.search_participation === 'notify_only');
    if (notifyOnlyMatches.length > 0) {
      const criteria = { school, hometownCity, currentCity, employer, birthYearFrom, birthYearTo };
      const values = notifyOnlyMatches.map((m) => [
        m.account_id,
        req.account.account_id,
        JSON.stringify(criteria),
        message || null,
      ]);
      await db.query(
        'INSERT INTO search_match_notifications (matched_account_id, searcher_account_id, search_criteria, message) VALUES ?',
        [values]
      );
    }

    res.json({ findableMatches });
  } catch (err) {
    next(err);
  }
});

router.get('/search-notifications', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT notification_id, searcher_account_id, search_criteria, message, status, created_at
       FROM search_match_notifications WHERE matched_account_id = ? ORDER BY created_at DESC`,
      [req.account.account_id]
    );
    res.json({ notifications: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/search-notifications/:id/respond', requireAuth, async (req, res, next) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT * FROM search_match_notifications WHERE notification_id = ? AND matched_account_id = ? AND status = 'pending' FOR UPDATE",
      [req.params.id, req.account.account_id]
    );
    const notification = rows[0];
    if (!notification) {
      await conn.rollback();
      return res.status(404).json({ error: 'Notification not found or already handled' });
    }

    await conn.query(
      `INSERT INTO connection_requests (sender_account_id, recipient_account_id, message, source)
       VALUES (?, ?, ?, 'search_match')`,
      [req.account.account_id, notification.searcher_account_id, message]
    );
    await conn.query(
      "UPDATE search_match_notifications SET status = 'responded' WHERE notification_id = ?",
      [req.params.id]
    );

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

router.post('/search-notifications/:id/ignore', requireAuth, async (req, res, next) => {
  try {
    const [result] = await db.query(
      "UPDATE search_match_notifications SET status = 'ignored' WHERE notification_id = ? AND matched_account_id = ? AND status = 'pending'",
      [req.params.id, req.account.account_id]
    );
    if (result.affectedRows === 0) {
      return res.status(409).json({ error: 'Notification not found or already handled' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
