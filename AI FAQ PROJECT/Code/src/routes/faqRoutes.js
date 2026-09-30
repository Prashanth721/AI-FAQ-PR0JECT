const express = require("express");
const {
  getAllFAQs,
  searchFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} = require("../controllers/faqController");
const { protect } = require("../middleware/authMiddleware");
const { validateFAQ } = require("../middleware/validationMiddleware");

const router = express.Router();

// NOTE: "/search" must be declared before "/:id" or Express will treat
// "search" as an :id value.
router.get("/", getAllFAQs);
router.get("/search", searchFAQs);
router.post("/", protect, validateFAQ, createFAQ);
router.put("/:id", protect, updateFAQ);
router.delete("/:id", protect, deleteFAQ);

module.exports = router;
