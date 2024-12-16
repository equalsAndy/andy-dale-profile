const db = require('../db');

// Check if an account exists for the given email
const checkAccount = async (email) => {
  const [results] = await db.query('SELECT * FROM accounts WHERE username = ?', [email]);
  return results.length > 0 ? results[0] : null;
};

// Add a new account for the given email
const addAccount = async (email) => {
  const [result] = await db.query(
    'INSERT INTO accounts (username, password_hash, profile_id, is_admin, created_at) VALUES (?, ?, ?, 0, NOW())',
    [email, 'placeholder_password_hash', null]
  );
  return result.insertId;
};

// Update account with the claimed profile_id using account email
const updateAccountProfile = async (accountEmail, profileId) => {
  const [result] = await db.query(
    'UPDATE accounts SET profile_id = ? WHERE username = ?',
    [profileId, accountEmail]
  );
  return result.affectedRows;
};

// Delete account by account_id or username
const deleteAccount = async ({ accountId, username }) => {
  let query = '';
  let params = [];

  if (accountId) {
    query = 'DELETE FROM accounts WHERE account_id = ?';
    params = [accountId];
  } else if (username) {
    query = 'DELETE FROM accounts WHERE username = ?';
    params = [username];
  } else {
    throw new Error('You must provide either accountId or username to delete an account.');
  }

  const [result] = await db.query(query, params);
  return result.affectedRows;
};

module.exports = {
  checkAccount,
  addAccount,
  updateAccountProfile,
  deleteAccount, // New method
};