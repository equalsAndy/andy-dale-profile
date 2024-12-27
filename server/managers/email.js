const db = require('../db');


const getPrimaryEmailByProfileId = async (profileId) => {
  const query = `
    SELECT email_address
    FROM emails
    WHERE profile_id = ? AND is_primary = 1
    LIMIT 1
  `;
  const [rows] = await db.execute(query, [profileId]);
  return rows.length > 0 ? rows[0].email_address : null;
};

const createMessage = async (senderAccountId, anonymizedEmail, recipientEmail, subject, body, status) => {
  const allowedStatuses = ['pending', 'sent', 'failed'];
  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid status value: ${status}. Allowed values are: ${allowedStatuses.join(', ')}`);
  }

  const query = `
    INSERT INTO messages (
      sender_email,
      anonymized_sender_email,
      recipient_email,
      subject,
      body,
      status
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [senderAccountId, anonymizedEmail, recipientEmail, subject, body, status];
  const [result] = await db.execute(query, params);
  return result.insertId; // Return the message ID
};

const createEmailAlias = async (uuid, accountId) => {
  const query = `
    INSERT INTO emailAlias (uuid, account_id)
    VALUES (?, ?)
  `;
  const params = [uuid, accountId];
  await db.execute(query, params);
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

const updatePrimaryEmail = async (profileId, email) => {
  const sql = `
    UPDATE emails
    SET email_address = ?, is_primary = 1
    WHERE profile_id = ?
  `;

  const params = [email, profileId];
  await db.query(sql, params);
};

module.exports = {
  createEmailAlias,
  getPrimaryEmailByProfileId,
  createMessage,
  updateMessageStatus,
  addEmail,
  updateEmail,
  deleteEmail,
  getEmails,
  updatePrimaryEmail,
};