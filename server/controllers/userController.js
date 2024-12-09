const userManager = require('../managers/user');
const emailManager = require('../managers/email')

const claimProfile = async (req, res) => {
  const { profileId, allowAndyContact = 0, allowPublicContact = 0 } = req.body;

  if (!profileId) {
    return res.status(400).send('profileId is required.');
  }

  if (!req.user || !req.user.email) {
    return res.status(401).send('You must be logged in to claim a profile.');
  }

  const userEmail = req.user.email;

  try {
    // Update the account to associate it with the claimed profile
    const updatedRows = await userManager.updateAccountProfile(userEmail, profileId);

    if (updatedRows === 0) {
      return res.status(404).send('Account not found or could not be updated.');
    }

    // Add an email record for the profile
    await emailManager.addEmail(
      profileId,
      userEmail,
      1, // isPrimary is true
      1, // allowAdminContact is always true
      allowAndyContact === 'true' ? 1 : 0, // Convert 'true'/'false' to 1/0
      allowPublicContact === 'true' ? 1 : 0 // Convert 'true'/'false' to 1/0
    );

    res.status(200).json({ message: 'Profile claimed successfully.' });
  } catch (err) {
    console.error('Error claiming profile:', err);
    res.status(500).send('Error claiming profile.');
  }
};

const ensureAccountExists = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    // Check if the account exists
    const existingAccount = await userManager.checkAccount(email);

    if (existingAccount) {
      return res.status(200).json({ message: 'Account already exists.' });
    }

    // Create a new account
    const newAccountId = await userManager.addAccount(email);

    return res.status(201).json({
      message: 'Account created successfully.',
      accountId: newAccountId,
    });
  } catch (error) {
    console.error('Error ensuring account exists:', error);
    return res.status(500).json({ message: 'Error ensuring account exists.' });
  }
};

module.exports = { 
  ensureAccountExists,
claimProfile
 };