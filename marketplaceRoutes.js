const express = require('express');
const c = require('../controllers/marketplaceController');
const router = express.Router();

router.get('/requests', c.listRequests);
router.post('/requests', express.json({ limit: '30kb' }), c.createRequest);
router.patch('/requests/:id', express.json({ limit: '10kb' }), c.updateRequest);
router.get('/messages', c.listMessages);
router.post('/messages', express.json({ limit: '10kb' }), c.createMessage);
router.post('/bookings', express.json({ limit: '10kb' }), c.createBooking);
router.post('/reviews', express.json({ limit: '20kb' }), c.createReview);
router.get('/stats', c.dashboard);

module.exports = router;
