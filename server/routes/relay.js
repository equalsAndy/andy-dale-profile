const crypto = require('crypto');
const express = require('express');
const db = require('../db');
const { sendRelayEmail } = require('../utils/relay');

const router = express.Router();

// Postmark posts to this URL with Basic Auth credentials embedded
// (https://user:pass@host/...), configured once in the Postmark dashboard.
const verifyWebhookAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return res.status(401).end();

  const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
  const expectedUser = Buffer.from(process.env.POSTMARK_WEBHOOK_USER || '');
  const expectedPass = Buffer.from(process.env.POSTMARK_WEBHOOK_PASS || '');
  const gotUser = Buffer.from(user || '');
  const gotPass = Buffer.from(pass || '');

  const matches =
    expectedUser.length === gotUser.length &&
    expectedPass.length === gotPass.length &&
    crypto.timingSafeEqual(expectedUser, gotUser) &&
    crypto.timingSafeEqual(expectedPass, gotPass);

  if (!matches) return res.status(401).end();
  next();
};

router.post('/relay/inbound', verifyWebhookAuth, async (req, res, next) => {
  try {
    const recipient = req.body.OriginalRecipient || req.body.ToFull?.[0]?.Email || req.body.To || '';
    const aliasToken = recipient.split('@')[0]?.trim();
    const senderEmail = req.body.FromFull?.Email || req.body.From;
    const bodyText = (req.body.TextBody || '').trim();

    if (!aliasToken || !senderEmail || !bodyText) {
      return res.status(200).json({ ok: true, skipped: 'missing alias/sender/body' });
    }

    const [threadRows] = await db.query(
      'SELECT thread_id, status, alias_token FROM message_threads WHERE alias_token = ?',
      [aliasToken]
    );
    const thread = threadRows[0];
    if (!thread || thread.status === 'blocked') {
      return res.status(200).json({ ok: true, skipped: 'unknown or blocked thread' });
    }

    // Sender is either a real account (matched by login_email) or an
    // external participant replying by email -- either is valid as long
    // as they're actually a participant of *this* thread.
    const [accountMatch] = await db.query(
      `SELECT tp.participant_id, a.account_id
       FROM thread_participants tp
       JOIN accounts a ON a.account_id = tp.account_id
       WHERE tp.thread_id = ? AND a.login_email = ?`,
      [thread.thread_id, senderEmail]
    );

    let senderAccountId = null;
    let senderExternalEmail = null;
    let senderParticipantId = null;

    if (accountMatch.length) {
      senderAccountId = accountMatch[0].account_id;
      senderParticipantId = accountMatch[0].participant_id;
    } else {
      const [externalMatch] = await db.query(
        'SELECT participant_id FROM thread_participants WHERE thread_id = ? AND external_email = ?',
        [thread.thread_id, senderEmail]
      );
      if (externalMatch.length) {
        senderExternalEmail = senderEmail;
        senderParticipantId = externalMatch[0].participant_id;
      }
    }

    if (!senderParticipantId) {
      return res.status(200).json({ ok: true, skipped: 'sender not a participant of this thread' });
    }

    const [otherRows] = await db.query(
      'SELECT account_id, external_email FROM thread_participants WHERE thread_id = ? AND participant_id != ?',
      [thread.thread_id, senderParticipantId]
    );
    const other = otherRows[0];

    let emailLinked = false;
    let toEmail = null;
    if (other?.account_id) {
      const [otherAccountRows] = await db.query(
        'SELECT login_email, notification_mode FROM accounts WHERE account_id = ?',
        [other.account_id]
      );
      emailLinked = otherAccountRows[0]?.notification_mode === 'email_linked';
      toEmail = otherAccountRows[0]?.login_email;
    } else if (other?.external_email) {
      emailLinked = true;
      toEmail = other.external_email;
    }

    const [insertResult] = await db.query(
      `INSERT INTO messages
         (thread_id, sender_account_id, sender_external_email, body, delivery_channel, relay_status, delivered_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        thread.thread_id,
        senderAccountId,
        senderExternalEmail,
        bodyText,
        emailLinked ? 'email' : 'in_app',
        emailLinked ? 'pending' : 'n/a',
      ]
    );
    await db.query('UPDATE message_threads SET last_activity_at = NOW() WHERE thread_id = ?', [
      thread.thread_id,
    ]);

    if (emailLinked && toEmail) {
      let senderName = senderEmail.split('@')[0];
      if (senderAccountId) {
        const [senderProfileRows] = await db.query(
          'SELECT first_name, preferred_name FROM profile WHERE account_id = ?',
          [senderAccountId]
        );
        senderName = senderProfileRows[0]?.preferred_name || senderProfileRows[0]?.first_name || senderName;
      }
      const { status, reason } = await sendRelayEmail({ aliasToken, toEmail, senderName, body: bodyText });
      await db.query('UPDATE messages SET relay_status = ?, failure_reason = ? WHERE message_id = ?', [
        status,
        reason || null,
        insertResult.insertId,
      ]);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
