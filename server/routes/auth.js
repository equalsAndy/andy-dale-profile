const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { hashPassword, verifyPassword } = require('../utils/password');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => `${req.ip}:${(req.body?.loginEmail || '').toLowerCase()}`,
  message: { error: 'Too many attempts, please try again later' },
});

router.post('/signup', loginLimiter, async (req, res, next) => {
  const { loginEmail, password, firstName, lastName, note } = req.body;
  if (!loginEmail || !password) {
    return res.status(400).json({ error: 'loginEmail and password are required' });
  }
  if (password.length < 10) {
    return res.status(400).json({ error: 'Password must be at least 10 characters' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      'SELECT account_id FROM accounts WHERE login_email = ?',
      [loginEmail]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const [accountResult] = await conn.query(
      'INSERT INTO accounts (login_email, password_hash) VALUES (?, ?)',
      [loginEmail, passwordHash]
    );
    const accountId = accountResult.insertId;

    await conn.query(
      'INSERT INTO profile (account_id, first_name, last_name) VALUES (?, ?, ?)',
      [accountId, firstName || 'Andy', lastName || 'Dale']
    );

    await conn.query('INSERT INTO join_requests (account_id, notes) VALUES (?, ?)', [
      accountId,
      note || null,
    ]);

    await conn.commit();
    req.session.accountId = accountId;
    res.status(201).json({ accountId, membershipStatus: 'pending' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

router.post('/login', loginLimiter, async (req, res, next) => {
  const { loginEmail, password } = req.body;
  if (!loginEmail || !password) {
    return res.status(400).json({ error: 'loginEmail and password are required' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM accounts WHERE login_email = ?', [loginEmail]);
    const account = rows[0];
    if (!account) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await verifyPassword(password, account.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    req.session.accountId = account.account_id;
    res.json({ accountId: account.account_id, membershipStatus: account.membership_status });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  res.json({ account: req.account });
});

module.exports = router;
