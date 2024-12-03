const db = require('../db');

const ensureAccountExists = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    // Check if the email exists in the emails table
    const [emailResult] = await db.query('SELECT * FROM emails WHERE email_address = ?', [email]);

    if (emailResult.length === 0) {
      // No profile found with the given email
      return res.status(404).json({ message: 'No profile associated with this email.' });
    }

    const profileId = emailResult[0].profile_id;

    // Check if an account already exists for this profile
    const [accountResult] = await db.query('SELECT * FROM accounts WHERE profile_id = ?', [profileId]);

    if (accountResult.length > 0) {
      // Account already exists
      return res.status(200).json({ message: 'Account already exists.' });
    }

    // Create a new account for the profile
    const [newAccountResult] = await db.query(
      'INSERT INTO accounts (username, password_hash, profile_id, is_admin, created_at) VALUES (?, ?, ?, 0, NOW())',
      [email, 'placeholder_password_hash', profileId] // Replace with actual password hash if needed
    );

    return res.status(201).json({
      message: 'Account created successfully.',
      accountId: newAccountResult.insertId,
      profileId,
    });
  } catch (error) {
    console.error('Error ensuring account exists:', error);
    return res.status(500).json({ message: 'Error ensuring account exists.' });
  }
};

module.exports = { ensureAccountExists };