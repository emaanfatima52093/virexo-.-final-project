const express = require("express");
const { requireAdmin } = require("../middleware/auth");
const {
  getInquiries,
  updateInquiry,
  deleteInquiry,
  getSubscribers,
  getStats,
} = require("../controllers/adminController");

const router = express.Router();
router.use(express.json({ limit: "10kb" }));
router.use(requireAdmin);

router.get("/stats", (req, res, next) => {
  try { getStats(req, res); } catch (err) { next(err); }
});
router.get("/inquiries", (req, res, next) => {
  try { getInquiries(req, res); } catch (err) { next(err); }
});
router.patch("/inquiries/:id", (req, res, next) => {
  try { updateInquiry(req, res); } catch (err) { next(err); }
});
router.delete("/inquiries/:id", (req, res, next) => {
  try { deleteInquiry(req, res); } catch (err) { next(err); }
});
router.get("/subscribers", (req, res, next) => {
  try { getSubscribers(req, res); } catch (err) { next(err); }
});

module.exports = router;
