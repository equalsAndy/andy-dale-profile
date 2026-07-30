const postmark = require('postmark');

const client = process.env.POSTMARK_API_KEY
  ? new postmark.ServerClient(process.env.POSTMARK_API_KEY)
  : null;

const relayAddress = (aliasToken) => `${aliasToken}@${process.env.RELAY_DOMAIN}`;

// Sends one message to a real inbox via the thread's alias. Returns
// { status: 'sent' } or { status: 'failed', reason }, never throws --
// callers persist the result onto the message row either way.
const sendRelayEmail = async ({ aliasToken, toEmail, senderName, body }) => {
  if (!client) return { status: 'failed', reason: 'Postmark not configured (missing POSTMARK_API_KEY)' };
  try {
    const result = await client.sendEmail({
      From: `${senderName} (Andy Dale) <${relayAddress(aliasToken)}>`,
      To: toEmail,
      ReplyTo: relayAddress(aliasToken),
      Subject: `New message from ${senderName} on Andy Dale`,
      TextBody: `${body}\n\n—\nReply to this email to respond. Your reply goes straight to ${senderName}, not to Andy Dale staff.`,
      MessageStream: 'outbound',
    });
    return { status: 'sent', messageId: result.MessageID };
  } catch (err) {
    return { status: 'failed', reason: err.message };
  }
};

module.exports = { sendRelayEmail, relayAddress };
