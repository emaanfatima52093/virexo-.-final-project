const db = require('../database/db');
const { validateNewsletterPayload } = require('../middleware/validators');
function postNewsletter(req, res) {
  const { valid, errors, data } = validateNewsletterPayload(req.body || {});
  if (!valid) return res.status(400).json({ error: errors.email });
  if (db.data.subscribers.some(s => s.email === data.email)) return res.status(200).json({ message: "You're already subscribed — thanks for sticking around!" });
  db.insert('subscribers', { email: data.email, created_at: new Date().toISOString() });
  res.status(201).json({ message: "Subscribed! You'll hear from us with occasional updates." });
}
module.exports = { postNewsletter };
