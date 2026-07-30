const db = require('../db');

// Loads the logged-in account (if any) onto req.account so downstream
// handlers never have to re-query it. Absent session = req.account null,
// not an error -- plenty of routes (e.g. public profile view) work either way.
const attachAccount = async (req, res, next) => {
  if (!req.session.accountId) {
    req.account = null;
    return next();
  }
  try {
    const [rows] = await db.query(
      `SELECT account_id, login_email, membership_status, is_admin,
              notification_mode, search_participation, comms_visibility
       FROM accounts WHERE account_id = ?`,
      [req.session.accountId]
    );
    req.account = rows[0] || null;
    next();
  } catch (err) {
    next(err);
  }
};

const requireAuth = (req, res, next) => {
  if (!req.account) return res.status(401).json({ error: 'Not logged in' });
  next();
};

const requireVerified = (req, res, next) => {
  if (!req.account || req.account.membership_status !== 'verified') {
    return res.status(403).json({ error: 'Verified account required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.account || !req.account.is_admin) {
    return res.status(403).json({ error: 'Admin account required' });
  }
  next();
};

module.exports = { attachAccount, requireAuth, requireVerified, requireAdmin };
