const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sendRelayEmail } = require('../utils/relay');
const { generateAliasToken } = require('../utils/alias');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const searchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  // No account required to search, so IP is the only identity we have.
  keyGenerator: (req) => req.ip,
  message: { error: 'Too many searches, please try again later' },
});

// Fully public -- no login required. David isn't an Andy Dale and never
// will be, but he might still be looking for one he knows. Findable
// matches come back directly either way; notify-only matches are only
// ever reachable if the searcher leaves a way to respond (their own
// account if logged in, or a contact email if not).
router.post('/search', searchLimiter, async (req, res, next) => {
  const { school, hometownCity, currentCity, employer, birthYearFrom, birthYearTo, message, searcherEmail } =
    req.body;

  if (!req.account && searcherEmail && !EMAIL_RE.test(searcherEmail)) {
    return res.status(400).json({ error: 'searcherEmail does not look like a valid email' });
  }

  const conditions = ["a.membership_status = 'verified'", "a.search_participation != 'invisible'"];
  const params = [];
  if (req.account) {
    conditions.push('p.account_id != ?');
    params.push(req.account.account_id);
  }

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

  const criteriaCount = conditions.length - (req.account ? 3 : 2);
  if (criteriaCount === 0) {
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
    if (notifyOnlyMatches.length > 0 && (req.account || searcherEmail)) {
      const criteria = { school, hometownCity, currentCity, employer, birthYearFrom, birthYearTo };
      const values = notifyOnlyMatches.map((m) => [
        m.account_id,
        req.account ? req.account.account_id : null,
        req.account ? null : searcherEmail,
        JSON.stringify(criteria),
        message || null,
      ]);
      await db.query(
        `INSERT INTO search_match_notifications
           (matched_account_id, searcher_account_id, searcher_email, search_criteria, message)
         VALUES ?`,
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
      `SELECT notification_id, searcher_account_id, searcher_email, search_criteria, message, status, created_at
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

    if (notification.searcher_account_id) {
      // Searcher has an account -- normal reverse first-contact request.
      await conn.query(
        `INSERT INTO connection_requests (sender_account_id, recipient_account_id, message, source)
         VALUES (?, ?, ?, 'search_match')`,
        [req.account.account_id, notification.searcher_account_id, message]
      );
    } else {
      // Searcher has no account (e.g. not an Andy Dale at all) -- go
      // straight to a thread with them as an external participant, same
      // as any other thread from this point on, just relayed by email.
      const aliasToken = generateAliasToken();
      const [threadResult] = await conn.query('INSERT INTO message_threads (alias_token) VALUES (?)', [
        aliasToken,
      ]);
      const threadId = threadResult.insertId;

      await conn.query(
        'INSERT INTO thread_participants (thread_id, account_id) VALUES (?, ?)',
        [threadId, req.account.account_id]
      );
      await conn.query(
        'INSERT INTO thread_participants (thread_id, external_email) VALUES (?, ?)',
        [threadId, notification.searcher_email]
      );
      const [msgResult] = await conn.query(
        `INSERT INTO messages (thread_id, sender_account_id, body, delivery_channel, relay_status, delivered_at)
         VALUES (?, ?, ?, 'email', 'pending', NOW())`,
        [threadId, req.account.account_id, message]
      );

      const [senderProfileRows] = await conn.query(
        'SELECT first_name, preferred_name FROM profile WHERE account_id = ?',
        [req.account.account_id]
      );
      const senderName =
        senderProfileRows[0]?.preferred_name || senderProfileRows[0]?.first_name || 'Andy';

      await conn.commit();

      const { status, reason } = await sendRelayEmail({
        aliasToken,
        toEmail: notification.searcher_email,
        senderName,
        body: message,
      });
      await db.query('UPDATE messages SET relay_status = ?, failure_reason = ? WHERE message_id = ?', [
        status,
        reason || null,
        msgResult.insertId,
      ]);

      await db.query("UPDATE search_match_notifications SET status = 'responded' WHERE notification_id = ?", [
        req.params.id,
      ]);
      return res.json({ ok: true, threadId });
    }

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
