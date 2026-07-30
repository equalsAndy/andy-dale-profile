const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/admin/join-requests', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT jr.request_id, jr.status, jr.notes, jr.created_at, jr.reviewed_at,
              a.account_id, a.login_email, p.first_name, p.last_name, p.current_city, p.current_country
       FROM join_requests jr
       JOIN accounts a ON a.account_id = jr.account_id
       JOIN profile p ON p.account_id = a.account_id
       ORDER BY jr.status = 'pending' DESC, jr.created_at DESC`
    );
    res.json({ requests: rows });
  } catch (err) {
    next(err);
  }
});

const decide = (newStatus, membershipStatus) => async (req, res, next) => {
  const { notes } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT account_id, status FROM join_requests WHERE request_id = ?', [
      req.params.id,
    ]);
    const request = rows[0];
    if (!request) {
      await conn.rollback();
      return res.status(404).json({ error: 'Join request not found' });
    }
    if (request.status !== 'pending') {
      await conn.rollback();
      return res.status(409).json({ error: `Request already ${request.status}` });
    }

    await conn.query(
      'UPDATE join_requests SET status = ?, reviewed_by = ?, notes = COALESCE(?, notes), reviewed_at = NOW() WHERE request_id = ?',
      [newStatus, req.account.account_id, notes || null, req.params.id]
    );
    await conn.query('UPDATE accounts SET membership_status = ? WHERE account_id = ?', [
      membershipStatus,
      request.account_id,
    ]);
    await conn.query(
      'INSERT INTO admin_audit_log (admin_account_id, action, target_type, target_id, notes) VALUES (?, ?, ?, ?, ?)',
      [req.account.account_id, `${newStatus}_join_request`, 'account', request.account_id, notes || null]
    );

    await conn.commit();
    res.json({ ok: true, status: newStatus });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

router.post('/admin/join-requests/:id/approve', requireAdmin, decide('approved', 'verified'));
router.post('/admin/join-requests/:id/deny', requireAdmin, decide('denied', 'denied'));

module.exports = router;
