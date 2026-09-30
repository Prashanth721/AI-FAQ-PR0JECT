const express = require("express");
const { generateFAQ, askAssistant } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const { validateTopic } = require("../middleware/validationMiddleware");

const router = express.Router();

router.post("/generate-faq", protect, validateTopic, generateFAQ);
router.post("/ask", askAssistant);

module.exports = router;
