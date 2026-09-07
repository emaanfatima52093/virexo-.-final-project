const express = require("express");
const { postContact } = require("../controllers/contactController");
const { formLimiter } = require("../middleware/rateLimiters");

const router = express.Router();
router.post("/", formLimiter, express.json({ limit: "20kb" }), (req, res, next) => {
  postContact(req, res).catch(next);
});

module.exports = router;
