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
    [email, 'placeholder_password_hash', null] // Replace with actual password hash if needed
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
  

module.exports = {
  checkAccount,
  addAccount,
  updateAccountProfile
};