const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sendRelayEmail } = require('../utils/relay');
const { generateAliasToken } = require('../utils/alias');

const router = express.Router();

// Returns the other participant's row -- { account_id, external_email } --
// with exactly one of the two set. Matches on participant_id rather than
// account_id so it works whether the other side is an account or external.
const otherParticipant = async (conn, threadId, myAccountId) => {
  const [meRows] = await conn.query(
    'SELECT participant_id FROM thread_participants WHERE thread_id = ? AND account_id = ?',
    [threadId, myAccountId]
  );
  if (!meRows[0]) return null;
  const [rows] = await conn.query(
    'SELECT account_id, external_email FROM thread_participants WHERE thread_id = ? AND participant_id != ?',
    [threadId, meRows[0].participant_id]
  );
  return rows[0] || null;
};

const assertParticipant = async (conn, threadId, accountId) => {
  const [rows] = await conn.query(
    'SELECT 1 FROM thread_participants WHERE thread_id = ? AND account_id = ?',
    [threadId, accountId]
  );
  return rows.length > 0;
};

// ---------- Connection requests (first-contact protocol) ----------
// Account-to-account only -- an external (non-account) party never
// initiates or accepts one of these; see search-notifications/:id/respond
// in search.js for how a matched Andy reaches an external searcher instead.

router.post('/connection-requests', requireAuth, async (req, res, next) => {
  const { recipientAccountId, message, source } = req.body;
  if (!recipientAccountId || !message) {
    return res.status(400).json({ error: 'recipientAccountId and message are required' });
  }
  if (Number(recipientAccountId) === req.account.account_id) {
    return res.status(400).json({ error: "You can't send a request to yourself" });
  }

  try {
    const [recipientRows] = await db.query(
      'SELECT account_id, comms_visibility FROM accounts WHERE account_id = ?',
      [recipientAccountId]
    );
    const recipient = recipientRows[0];
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });

    const senderVerified = req.account.membership_status === 'verified';
    if (recipient.comms_visibility === 'verified_only' && !senderVerified) {
      return res.status(403).json({ error: 'This Andy only accepts requests from verified accounts' });
    }

    const [existing] = await db.query(
      `SELECT request_id FROM connection_requests
       WHERE status = 'pending'
         AND ((sender_account_id = ? AND recipient_account_id = ?)
           OR (sender_account_id = ? AND recipient_account_id = ?))`,
      [req.account.account_id, recipientAccountId, recipientAccountId, req.account.account_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'A pending request already exists between you two' });
    }

    const [result] = await db.query(
      `INSERT INTO connection_requests (sender_account_id, recipient_account_id, message, source)
       VALUES (?, ?, ?, ?)`,
      [req.account.account_id, recipientAccountId, message, source === 'search_match' ? 'search_match' : 'direct']
    );
    res.status(201).json({ requestId: result.insertId, status: 'pending' });
  } catch (err) {
    next(err);
  }
});

router.get('/connection-requests', requireAuth, async (req, res, next) => {
  try {
    const [incoming] = await db.query(
      `SELECT cr.request_id, cr.message, cr.status, cr.source, cr.created_at,
              p.account_id AS sender_account_id, p.first_name, p.last_name, p.current_city, p.current_country
       FROM connection_requests cr
       JOIN profile p ON p.account_id = cr.sender_account_id
       WHERE cr.recipient_account_id = ? AND cr.status = 'pending'
       ORDER BY cr.created_at DESC`,
      [req.account.account_id]
    );
    const [outgoing] = await db.query(
      `SELECT cr.request_id, cr.message, cr.status, cr.source, cr.created_at,
              p.account_id AS recipient_account_id, p.first_name, p.last_name, p.current_city, p.current_country
       FROM connection_requests cr
       JOIN profile p ON p.account_id = cr.recipient_account_id
       WHERE cr.sender_account_id = ?
       ORDER BY cr.created_at DESC`,
      [req.account.account_id]
    );
    res.json({ incoming, outgoing });
  } catch (err) {
    next(err);
  }
});

router.post('/connection-requests/:id/accept', requireAuth, async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM connection_requests WHERE request_id = ? FOR UPDATE', [
      req.params.id,
    ]);
    const request = rows[0];
    if (!request || request.recipient_account_id !== req.account.account_id) {
      await conn.rollback();
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.status !== 'pending') {
      await conn.rollback();
      return res.status(409).json({ error: `Request already ${request.status}` });
    }

    const aliasToken = generateAliasToken();
    const [threadResult] = await conn.query(
      'INSERT INTO message_threads (alias_token) VALUES (?)',
      [aliasToken]
    );
    const threadId = threadResult.insertId;

    await conn.query(
      'INSERT INTO thread_participants (thread_id, account_id) VALUES (?, ?), (?, ?)',
      [threadId, request.sender_account_id, threadId, request.recipient_account_id]
    );

    await conn.query(
      "UPDATE connection_requests SET status = 'accepted', responded_at = NOW() WHERE request_id = ?",
      [req.params.id]
    );

    // The request message itself becomes the thread's first message.
    await conn.query(
      'INSERT INTO messages (thread_id, sender_account_id, body, delivered_at) VALUES (?, ?, ?, NOW())',
      [threadId, request.sender_account_id, request.message]
    );

    await conn.commit();
    res.json({ threadId });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

router.post('/connection-requests/:id/decline', requireAuth, async (req, res, next) => {
  try {
    const [result] = await db.query(
      "UPDATE connection_requests SET status = 'declined', responded_at = NOW() WHERE request_id = ? AND recipient_account_id = ? AND status = 'pending'",
      [req.params.id, req.account.account_id]
    );
    if (result.affectedRows === 0) {
      return res.status(409).json({ error: 'Request not found or already resolved' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Threads & messages ----------

router.get('/threads', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT
         mt.thread_id, mt.status, mt.last_activity_at,
         other.account_id AS other_account_id,
         other.external_email AS other_external_email,
         p.first_name, p.last_name, p.current_city, p.current_country,
         a.membership_status,
         (SELECT body FROM messages m WHERE m.thread_id = mt.thread_id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
         (SELECT COUNT(*) FROM messages m
            WHERE m.thread_id = mt.thread_id
              AND (m.sender_account_id IS NULL OR m.sender_account_id != ?)
              AND m.read_at IS NULL) AS unread_count
       FROM message_threads mt
       JOIN thread_participants me ON me.thread_id = mt.thread_id AND me.account_id = ?
       JOIN thread_participants other ON other.thread_id = mt.thread_id AND other.participant_id != me.participant_id
       LEFT JOIN profile p ON p.account_id = other.account_id
       LEFT JOIN accounts a ON a.account_id = other.account_id
       ORDER BY mt.last_activity_at DESC`,
      [req.account.account_id, req.account.account_id]
    );
    res.json({ threads: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/threads/:id/messages', requireAuth, async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    if (!(await assertParticipant(conn, req.params.id, req.account.account_id))) {
      conn.release();
      return res.status(403).json({ error: 'Not a participant in this thread' });
    }

    await conn.query(
      `UPDATE messages SET read_at = NOW()
       WHERE thread_id = ? AND (sender_account_id IS NULL OR sender_account_id != ?) AND read_at IS NULL`,
      [req.params.id, req.account.account_id]
    );

    const [messages] = await conn.query(
      `SELECT message_id, sender_account_id, sender_external_email, body, delivery_channel,
              relay_status, delivered_at, read_at, created_at
       FROM messages WHERE thread_id = ? ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json({ messages });
  } catch (err) {
    next(err);
  } finally {
    conn.release();
  }
});

router.post('/threads/:id/messages', requireAuth, async (req, res, next) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'body is required' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    if (!(await assertParticipant(conn, req.params.id, req.account.account_id))) {
      await conn.rollback();
      return res.status(403).json({ error: 'Not a participant in this thread' });
    }

    const [threadRows] = await conn.query('SELECT status, alias_token FROM message_threads WHERE thread_id = ?', [
      req.params.id,
    ]);
    if (threadRows[0]?.status === 'blocked') {
      await conn.rollback();
      return res.status(403).json({ error: 'This thread is blocked' });
    }
    const aliasToken = threadRows[0].alias_token;

    const otherRow = await otherParticipant(conn, req.params.id, req.account.account_id);
    let emailLinked = false;
    let toEmail = null;
    if (otherRow?.account_id) {
      const [otherAccountRows] = await conn.query(
        'SELECT login_email, notification_mode FROM accounts WHERE account_id = ?',
        [otherRow.account_id]
      );
      emailLinked = otherAccountRows[0]?.notification_mode === 'email_linked';
      toEmail = otherAccountRows[0]?.login_email;
    } else if (otherRow?.external_email) {
      // External participants have no in-app inbox -- email is the only channel.
      emailLinked = true;
      toEmail = otherRow.external_email;
    }

    const [senderProfileRows] = await conn.query(
      'SELECT first_name, preferred_name FROM profile WHERE account_id = ?',
      [req.account.account_id]
    );
    const senderName = senderProfileRows[0]?.preferred_name || senderProfileRows[0]?.first_name || 'Andy';

    const [result] = await conn.query(
      `INSERT INTO messages (thread_id, sender_account_id, body, delivery_channel, relay_status, delivered_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [req.params.id, req.account.account_id, body, emailLinked ? 'email' : 'in_app', emailLinked ? 'pending' : 'n/a']
    );
    const messageId = result.insertId;

    await conn.query('UPDATE message_threads SET last_activity_at = NOW() WHERE thread_id = ?', [
      req.params.id,
    ]);

    await conn.commit();
    res.status(201).json({ messageId });

    if (emailLinked && toEmail) {
      const { status, reason } = await sendRelayEmail({ aliasToken, toEmail, senderName, body });
      await db.query('UPDATE messages SET relay_status = ?, failure_reason = ? WHERE message_id = ?', [
        status,
        reason || null,
        messageId,
      ]);
    }
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

router.post('/threads/:id/block', requireAuth, async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    if (!(await assertParticipant(conn, req.params.id, req.account.account_id))) {
      await conn.rollback();
      return res.status(403).json({ error: 'Not a participant in this thread' });
    }
    const otherRow = await otherParticipant(conn, req.params.id, req.account.account_id);

    await conn.query(
      "UPDATE message_threads SET status = 'blocked', alias_token = ? WHERE thread_id = ?",
      [generateAliasToken(), req.params.id]
    );
    // blocks is account-to-account only; an external party has nothing to
    // record there, but the thread itself is already blocked above either way.
    if (otherRow?.account_id) {
      await conn.query(
        'INSERT IGNORE INTO blocks (blocker_account_id, blocked_account_id) VALUES (?, ?)',
        [req.account.account_id, otherRow.account_id]
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
