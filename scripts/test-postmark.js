// One-off manual check that outbound sending through Postmark works end to
// end (API token valid, sending domain authenticated). Run with:
//   node scripts/test-postmark.js you@yourrealemail.com
require('dotenv').config();

const to = process.argv[2];
if (!to) {
  console.error('Usage: node scripts/test-postmark.js <recipient-email>');
  process.exit(1);
}
if (!process.env.POSTMARK_API_KEY) {
  console.error('Missing POSTMARK_API_KEY in .env');
  process.exit(1);
}

const postmark = require('postmark');
const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

client.sendEmail({
  From: process.env.POSTMARK_FROM_EMAIL || `relay-test@${process.env.RELAY_DOMAIN || 'reply.andydale.me'}`,
  To: to,
  Subject: 'Andy Dale relay test',
  TextBody: 'If you got this, outbound sending through Postmark is working.',
  MessageStream: 'outbound',
})
  .then((result) => {
    console.log('Sent OK:', result.MessageID);
  })
  .catch((err) => {
    console.error('Send failed:', err.message);
    process.exit(1);
  });
