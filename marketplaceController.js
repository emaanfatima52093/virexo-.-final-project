const db = require('../database/db');
const now = () => new Date().toISOString();

function listRequests(req, res) {
  res.json(db.all('marketplace_requests').sort((a, b) => b.id - a.id));
}

function createRequest(req, res) {
  const {
    client_name, client_email, provider_id, provider_name, service,
    package_name, budget, deadline, message
  } = req.body || {};

  if (!client_name || !client_email || !service || !message) {
    return res.status(400).json({
      error: 'Name, email, service and project description are required.'
    });
  }

  const row = db.insert('marketplace_requests', {
    client_name: String(client_name).trim(),
    client_email: String(client_email).trim(),
    provider_id: provider_id || null,
    provider_name: provider_name || null,
    service: String(service).trim(),
    package_name: package_name || null,
    budget: budget || null,
    deadline: deadline || null,
    message: String(message).trim(),
    status: 'Pending',
    created_at: now(),
    updated_at: null
  });

  res.status(201).json(row);
}

function updateRequest(req, res) {
  const row = db.findById('marketplace_requests', req.params.id);
  const { status } = req.body || {};
  const allowed = ['Pending', 'Accepted', 'In Progress', 'Review', 'Completed', 'Rejected'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid project status.' });
  }
  if (!row) {
    return res.status(404).json({ error: 'Project request not found.' });
  }

  row.status = status;
  row.updated_at = now();
  db.save();
  res.json(row);
}

function createMessage(req, res) {
  const { request_id, sender, message } = req.body || {};
  if (!sender || !message) {
    return res.status(400).json({ error: 'Sender and message are required.' });
  }

  res.status(201).json(db.insert('marketplace_messages', {
    request_id: request_id || null,
    sender: String(sender).trim(),
    message: String(message).trim(),
    created_at: now()
  }));
}

function listMessages(req, res) {
  let rows = db.all('marketplace_messages');
  if (req.query.request_id) {
    rows = rows.filter(r => Number(r.request_id) === Number(req.query.request_id));
  }
  res.json(rows.sort((a, b) => a.id - b.id));
}

function createBooking(req, res) {
  const { client_name, client_email, provider_id, provider_name, date, time } = req.body || {};
  if (!client_name || !client_email || !date || !time) {
    return res.status(400).json({ error: 'Name, email, date and time are required.' });
  }

  res.status(201).json(db.insert('marketplace_bookings', {
    client_name: String(client_name).trim(),
    client_email: String(client_email).trim(),
    provider_id: provider_id || null,
    provider_name: provider_name || null,
    date: String(date),
    time: String(time),
    status: 'Requested',
    created_at: now()
  }));
}

function createReview(req, res) {
  const { request_id, provider_id, client_name, rating, review } = req.body || {};
  const n = Number(rating);

  if (!provider_id || !client_name || !review || n < 1 || n > 5) {
    return res.status(400).json({
      error: 'Provider, name, rating and review are required.'
    });
  }

  res.status(201).json(db.insert('marketplace_reviews', {
    request_id: request_id || null,
    provider_id: String(provider_id),
    client_name: String(client_name).trim(),
    rating: n,
    review: String(review).trim(),
    created_at: now()
  }));
}

function dashboard(req, res) {
  const requests = db.data.marketplace_requests;
  res.json({
    requests: requests.length,
    active: requests.filter(r => ['Accepted', 'In Progress', 'Review'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'Completed').length,
    bookings: db.data.marketplace_bookings.length,
    reviews: db.data.marketplace_reviews.length
  });
}

module.exports = {
  listRequests,
  createRequest,
  updateRequest,
  createMessage,
  listMessages,
  createBooking,
  createReview,
  dashboard
};
