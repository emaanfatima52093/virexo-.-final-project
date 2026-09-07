const express = require("express");
const { postChat } = require("../controllers/chatController");
const { chatLimiter } = require("../middleware/rateLimiters");

const router = express.Router();
router.post("/", chatLimiter, express.json({ limit: "50kb" }), (req, res, next) => {
  postChat(req, res).catch(next);
});

module.exports = router;
