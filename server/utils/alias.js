const crypto = require('crypto');

// Random, not derived from account ids -- a leaked token only exposes the
// one thread it belongs to, not a reversible mapping to real accounts.
const generateAliasToken = () => crypto.randomBytes(16).toString('hex');

module.exports = { generateAliasToken };
