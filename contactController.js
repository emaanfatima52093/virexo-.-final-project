const db = require('../database/db');
const { validateContactPayload } = require('../middleware/validators');
const { sendInquiryNotification, sendInquiryConfirmation } = require('../services/emailService');
async function postContact(req, res) {
  const { valid, errors, data } = validateContactPayload(req.body || {});
  if (!valid) return res.status(400).json({ error: 'Please correct the highlighted fields.', fieldErrors: errors });
  const inquiry = db.insert('inquiries', { ...data, status: 'New', created_at: new Date().toISOString() });
  const [notification, confirmation] = await Promise.allSettled([sendInquiryNotification(inquiry), sendInquiryConfirmation(inquiry)]);
  if (notification.status === 'rejected') console.error('[contact] admin notification email failed:', notification.reason?.message);
  if (confirmation.status === 'rejected') console.error('[contact] confirmation email failed:', confirmation.reason?.message);
  res.status(201).json({ message: 'Your inquiry has been submitted successfully.', id: inquiry.id });
}
module.exports = { postContact };
