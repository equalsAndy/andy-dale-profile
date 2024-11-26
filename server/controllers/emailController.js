const db = require('../db');
const sendEmailUtil = require('../utils/sendEmail');

// Function to send an email
const sendAdminMessage = async (req, res) => {
    console.log('sendAdminMessage route hit');
    const { subject, message, email } = req.body;

    // Default values for user_id and recipient_email
    const userId = 2;
    const to = 'equalsandy@gmail.com';

    // Validate required fields
    if (!subject || !message) {
        return res.status(400).send('Subject and message are required');
    }

    // Define initial status as 'pending'
    const status = 'pending';

    // Prepare the SQL query and parameters
    const sql = `
      INSERT INTO messages 
      (user_id, recipient_email, subject, body, sent_at, status, sender_email) 
      VALUES (?, ?, ?, ?, NOW(), ?, ?)
    `;
    const params = [userId, to, subject, message, status, email || null];

    // Save the message to the database
    db.query(sql, params, async (err, results) => {
        if (err) {
            console.error('Error saving message to the database:', err);
            return res.status(500).send('Error saving message');
        }

        const messageId = results.insertId;

        try {
            // Call the utility function to send the email
            const emailResponse = await sendEmailUtil({
                to,
                subject,
                text: message, // Use the `message` as plain text
                html: null, // No HTML content provided
            });

            let finalStatus = 'sent';
            if (!emailResponse.success) {
                finalStatus = 'failed';
            }

            // Update the message status after attempting to send
            const updateSql = `
              UPDATE messages 
              SET status = ?, failure_reason = ? 
              WHERE message_id = ?
            `;
            const updateParams = [
                finalStatus,
                emailResponse.success ? null : emailResponse.error?.message || 'Unknown error',
                messageId,
            ];

            db.query(updateSql, updateParams, (updateErr) => {
                if (updateErr) {
                    console.error('Error updating message status:', updateErr);
                    return res.status(500).send('Error updating message status');
                }

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
            });
        } catch (error) {
            console.error('Error sending email:', error);

            // Update the message status to 'failed' if sending throws an exception
            const updateSql = `
              UPDATE messages 
              SET status = 'failed', failure_reason = ? 
              WHERE message_id = ?
            `;
            const updateParams = [error.message, messageId];

            db.query(updateSql, updateParams, (updateErr) => {
                if (updateErr) {
                    console.error('Error updating message status:', updateErr);
                    return res.status(500).send('Error updating message status');
                }
                res.status(500).send('Error sending email');
            });
        }
    });
};

// Function to add an email for a user
const addEmail = (req, res) => {
    const { 
      userId, 
      emailAddress, 
      isPrimary = 0, 
      allowAdminContact = 1, 
      allowAndyContact = 0, 
      allowPublicContact = 0 
    } = req.body;
  
    if (!userId || !emailAddress) {
      return res.status(400).send('userId and emailAddress are required');
    }
  
    const sql = `
      INSERT INTO emails 
      (user_id, email_address, is_primary, allow_admin_contact, allow_andy_contact, allow_public_contact) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [userId, emailAddress, isPrimary, allowAdminContact, allowAndyContact, allowPublicContact];
  
    db.query(sql, params, (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.error('Duplicate email:', emailAddress);
          return res.status(409).send('This email address is already registered.');
        }
        console.error('Error adding email:', err);
        return res.status(500).send('Error adding email');
      }
      res.status(201).json({ emailId: results.insertId, message: 'Email added successfully' });
    });
  };

// Function to update an email for a user
const updateEmail = (req, res) => {
  const { emailId, emailAddress, isPrimary, verified } = req.body;

  if (!emailId) {
    return res.status(400).send('emailId is required');
  }

  const sql = 'UPDATE emails SET email_address = ?, is_primary = ?, verified = ? WHERE email_id = ?';
  const params = [emailAddress, isPrimary || 0, verified || 0, emailId];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error updating email:', err);
      return res.status(500).send('Error updating email');
    }

    if (results.affectedRows === 0) {
      return res.status(404).send('Email not found');
    }

    res.send('Email updated successfully');
  });
};

// Function to delete an email
const deleteEmail = (req, res) => {
  const { emailId } = req.params;

  if (!emailId) {
    return res.status(400).send('emailId is required');
  }

  const sql = 'DELETE FROM emails WHERE email_id = ?';
  const params = [emailId];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error deleting email:', err);
      return res.status(500).send('Error deleting email');
    }

    if (results.affectedRows === 0) {
      return res.status(404).send('Email not found');
    }

    res.send('Email deleted successfully');
  });
};

// Function to get all emails for a user
const getEmails = (req, res) => {
  const { userId } = req.body; // Extract userId directly from the body

  if (!userId) {
    return res.status(400).send('userId is required');
  }

  const sql = 'SELECT * FROM emails WHERE user_id = ?';
  const params = [userId];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching emails:', err);
      return res.status(500).send('Error fetching emails');
    }

    res.json(results);
  });
};

module.exports = {
    sendAdminMessage,
  addEmail,
  updateEmail,
  deleteEmail,
  getEmails,
};