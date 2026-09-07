const express = require("express");
const { postNewsletter } = require("../controllers/newsletterController");
const { formLimiter } = require("../middleware/rateLimiters");

const router = express.Router();
router.post("/", formLimiter, express.json({ limit: "5kb" }), (req, res, next) => {
  try {
    postNewsletter(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
