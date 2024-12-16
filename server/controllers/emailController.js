
const { v4: uuidv4 } = require('uuid'); // For generating unique UUIDs
const emailManager = require('../managers/email');
const sendEmailUtil = require('../utils/sendEmail');



// Function to send an Andy-to-Andy message
const sendAndyToAndyMessage = async (req, res) => {
  console.log('sendAndyToAndyMessage route hit');
  const { subject, message, senderAccountId, recipientProfileId } = req.body;

  if (!subject || !message || !senderAccountId || !recipientProfileId) {
    return res.status(400).send('Subject, message, senderAccountId, and recipientProfileId are required');
  }

  const status = 'pending';
  const uuid = uuidv4(); // Generate a unique UUID
  const anonymizedEmail = `${uuid}@andydale.me`; // Anonymized email address

  try {
    // Step 1: Fetch recipient's primary email
    const recipientEmail = await emailManager.getPrimaryEmailByProfileId(recipientProfileId);
    if (!recipientEmail) {
      return res.status(404).send('Recipient does not have a primary email');
    }

    // Step 2: Save the message to the database with the anonymized email
    const messageId = await emailManager.createMessage(
      senderAccountId, // Key the alias against the sender's account_id
      anonymizedEmail, // Anonymized sender email
      recipientEmail,  // Recipient's primary email
      subject,
      message,
      status
    );

    // Step 3: Save the alias mapping (UUID -> senderAccountId) to the emailAlias table
    await emailManager.createEmailAlias(uuid, senderAccountId);

    // Step 4: Send the email
    const emailResponse = await sendEmailUtil({
      from: anonymizedEmail,
      to: recipientEmail,
      subject,
      text: `from: ${anonymizedEmail}\n\nMessage: ${message}`, // Plain text email
      html: null, // No HTML content
    });

    // Step 5: Update the message status in the database
    const finalStatus = emailResponse.success ? 'sent' : 'failed';
    await emailManager.updateMessageStatus(
      messageId,
      finalStatus,
      emailResponse.success ? null : emailResponse.error?.message || 'Unknown error'
    );

    // Step 6: Respond to the client
    if (emailResponse.success) {
      res.status(200).json({
        messageId,
        emailMessageId: emailResponse.messageId,
        alias: anonymizedEmail,
        message: 'Email sent and saved successfully',
      });
    } else {
      res.status(500).json({
        messageId,
        error: emailResponse.error?.message || 'Failed to send email',
        message: 'Email sending failed',
      });
    }
  } catch (err) {
    console.error('Error processing Andy-to-Andy message:', err);
    res.status(500).send('Error processing message');
  }
};


// Function to send an email to admin
const sendAdminMessage = async (req, res) => {
  console.log('sendAdminMessage route hit');
  const { subject, message, email } = req.body;

  const profileId = 2; // Default profile_id for admin messages
  const to = 'equalsandy@gmail.com'; // Default recipient email address

  if (!subject || !message) {
    return res.status(400).send('Subject and message are required');
  }

  const status = 'pending';

  try {
    // Step 1: Save the message to the database
    const messageId = await emailManager.createMessage(profileId, to, subject, message, status, email);

    // Step 2: Prepare sender's email
    const from = email || 'Unknown';

    // Step 3: Send the email
    const emailResponse = await sendEmailUtil({
      from,
      to,
      subject,
      text: `from: ${from}\n\nMessage: ${message}`, // Plain text email
      html: null, // No HTML content
    });

    // Step 4: Update the message status in the database
    const finalStatus = emailResponse.success ? 'sent' : 'failed';
    await emailManager.updateMessageStatus(
      messageId,
      finalStatus,
      emailResponse.success ? null : emailResponse.error?.message || 'Unknown error'
    );

    // Step 5: Respond to the client
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
  } catch (err) {
    console.error('Error processing admin message:', err);
    res.status(500).send('Error processing admin message');
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
  sendAndyToAndyMessage,
  sendAdminMessage,
  addEmail,
  updateEmail,
  deleteEmail,
  getEmails,
};