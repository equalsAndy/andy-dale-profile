const emailManager = require('../managers/email');
const sendEmailUtil = require('../utils/sendEmail');

// Function to send an email
const sendAdminMessage = async (req, res) => {
  console.log('sendAdminMessage route hit');
  const { subject, message, email } = req.body;

  const profileId = 2; // Default profile_id
  const to = 'equalsandy@gmail.com'; // Default recipient_email

  if (!subject || !message) {
    return res.status(400).send('Subject and message are required');
  }

  const status = 'pending';

  try {
    const messageId = await emailManager.createMessage(profileId, to, subject, message, status, email);

    try {
      const emailResponse = await sendEmailUtil({
        to,
        subject,
        text: message, // Plain text email
        html: null,    // No HTML content
      });

      const finalStatus = emailResponse.success ? 'sent' : 'failed';

      await emailManager.updateMessageStatus(
        messageId,
        finalStatus,
        emailResponse.success ? null : emailResponse.error?.message || 'Unknown error'
      );

      if (emailResponse.success) {
        res.status(200).json({
          messageId,
          emailMessageId: emailResponse.messageId,
          message: 'Email sent and saved successfully',
        });
      } else {
        res.status(500).json({
          messageId,
          error: emailResponse.error?.message || 'Failed to send email',
          message: 'Email sending failed',
        });
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      await emailManager.updateMessageStatus(messageId, 'failed', emailError.message);
      res.status(500).send('Error sending email');
    }
  } catch (err) {
    console.error('Error saving message to the database:', err);
    res.status(500).send('Error saving message');
  }
};

// Function to add an email for a profile
const addEmail = async (req, res) => {
  const {
    profileId,
    emailAddress,
    isPrimary = 0,
    allowAdminContact = 1,
    allowAndyContact = 0,
    allowPublicContact = 0,
  } = req.body;

  if (!profileId || !emailAddress) {
    return res.status(400).send('profileId and emailAddress are required');
  }

  try {
    await emailManager.addEmail(profileId, emailAddress, isPrimary, allowAdminContact, allowAndyContact, allowPublicContact);
    res.status(201).json({ message: 'Email added successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.error('Duplicate email:', emailAddress);
      res.status(409).send('This email address is already registered.');
    } else {
      console.error('Error adding email:', err);
      res.status(500).send('Error adding email');
    }
  }
};

// Function to update an email for a profile
const updateEmail = async (req, res) => {
  const { emailId, emailAddress, isPrimary, verified } = req.body;

  if (!emailId) {
    return res.status(400).send('emailId is required');
  }

  try {
    const affectedRows = await emailManager.updateEmail(emailId, emailAddress, isPrimary, verified);

    if (affectedRows === 0) {
      return res.status(404).send('Email not found');
    }

    res.send('Email updated successfully');
  } catch (err) {
    console.error('Error updating email:', err);
    res.status(500).send('Error updating email');
  }
};

// Function to delete an email
const deleteEmail = async (req, res) => {
  const { emailId } = req.params;

  if (!emailId) {
    return res.status(400).send('emailId is required');
  }

  try {
    const affectedRows = await emailManager.deleteEmail(emailId);

    if (affectedRows === 0) {
      return res.status(404).send('Email not found');
    }

    res.send('Email deleted successfully');
  } catch (err) {
    console.error('Error deleting email:', err);
    res.status(500).send('Error deleting email');
  }
};

// Function to get all emails for a profile
const getEmails = async (req, res) => {
  const { profileId } = req.body;

  if (!profileId) {
    return res.status(400).send('profileId is required');
  }

  try {
    const emails = await emailManager.getEmails(profileId);
    res.json(emails);
  } catch (err) {
    console.error('Error fetching emails:', err);
    res.status(500).send('Error fetching emails');
  }
};

module.exports = {
  sendAdminMessage,
  addEmail,
  updateEmail,
  deleteEmail,
  getEmails,
};