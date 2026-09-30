const FAQ = require("../models/FAQ");

// @route   GET /api/faqs
// @desc    Get all FAQs (public list)
// @access  Public
const getAllFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/faqs/search?q=keyword
// @desc    Search FAQs by keyword in question/answer/category
// @access  Public
const searchFAQs = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    const faqs = await FAQ.find({
      $or: [
        { question: { $regex: q, $options: "i" } },
        { answer: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    });

    res.status(200).json(faqs);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/faqs
// @desc    Create a new FAQ
// @access  Private (logged-in users)
const createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category } = req.body;

    const faq = await FAQ.create({
      question,
      answer,
      category,
      createdBy: req.user._id,
    });

    res.status(201).json(faq);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/faqs/:id
// @desc    Update an FAQ (only its own author or an admin)
// @access  Private
const updateFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    const isOwner = faq.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to edit this FAQ" });
    }

    Object.assign(faq, req.body);
    const updated = await faq.save();

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/faqs/:id
// @desc    Delete an FAQ (only its own author or an admin)
// @access  Private
const deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    const isOwner = faq.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this FAQ" });
    }

    await faq.deleteOne();
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllFAQs, searchFAQs, createFAQ, updateFAQ, deleteFAQ };
