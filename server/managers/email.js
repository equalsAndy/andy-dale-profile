const db = require('../db');

const createMessage = async (profileId, recipientEmail, subject, body, status, senderEmail) => {
  const [results] = await db.query(
    `
    INSERT INTO messages 
    (profile_id, recipient_email, subject, body, sent_at, status, sender_email) 
    VALUES (?, ?, ?, ?, NOW(), ?, ?)
    `,
    [profileId, recipientEmail, subject, body, status, senderEmail || null]
  );
  return results.insertId;
};

const updateMessageStatus = async (messageId, status, failureReason) => {
  await db.query(
    `
    UPDATE messages 
    SET status = ?, failure_reason = ? 
    WHERE message_id = ?
    `,
    [status, failureReason, messageId]
  );
};

const addEmail = async (profileId, emailAddress, isPrimary, allowAdminContact, allowAndyContact, allowPublicContact) => {
  await db.query(
    `
    INSERT INTO emails 
    (profile_id, email_address, is_primary, allow_admin_contact, allow_andy_contact, allow_public_contact) 
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [profileId, emailAddress, isPrimary, allowAdminContact, allowAndyContact, allowPublicContact]
  );
};

const updateEmail = async (emailId, emailAddress, isPrimary, verified) => {
  const [results] = await db.query(
    `
    UPDATE emails 
    SET email_address = ?, is_primary = ?, verified = ? 
    WHERE email_id = ?
    `,
    [emailAddress, isPrimary || 0, verified || 0, emailId]
  );
  return results.affectedRows;
};

const deleteEmail = async (emailId) => {
  const [results] = await db.query('DELETE FROM emails WHERE email_id = ?', [emailId]);
  return results.affectedRows;
};

const getEmails = async (profileId) => {
  const [results] = await db.query('SELECT * FROM emails WHERE profile_id = ?', [profileId]);
  return results;
};

module.exports = {
  createMessage,
  updateMessageStatus,
  addEmail,
  updateEmail,
  deleteEmail,
  getEmails,
};