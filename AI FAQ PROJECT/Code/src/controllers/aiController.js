const FAQ = require("../models/FAQ");
const { generateFAQFromTopic, answerFromFAQs } = require("../services/geminiService");

// @route   POST /api/ai/generate-faq
// @desc    Use Gemini to generate a question+answer+category from a topic
// @access  Private
const generateFAQ = async (req, res, next) => {
  try {
    const { topic } = req.body;
    const generated = await generateFAQFromTopic(topic);

    // This is only a draft - it is NOT saved to the database yet.
    // The user/creator reviews it and POSTs it to /api/faqs to save it.
    res.status(200).json({
      generated,
      note: "This is a draft. POST it to /api/faqs to save it permanently.",
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/ai/ask
// @desc    Ask a free-text question and get an AI answer grounded in existing FAQs
// @access  Public
const askAssistant = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "A 'question' is required" });
    }

    const faqs = await FAQ.find().limit(50);

    if (faqs.length === 0) {
      return res.status(200).json({
        answer: "There are no FAQs in the system yet, so I don't have information to answer from.",
      });
    }

    const answer = await answerFromFAQs(question, faqs);
    res.status(200).json({ answer });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateFAQ, askAssistant };
