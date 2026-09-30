// Simple reusable request-body validators.
// Each one checks required fields exist before the request reaches the controller.

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const missing = [];

  if (!name) missing.push("name");
  if (!email) missing.push("email");
  if (!password) missing.push("password");

  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required field(s): ${missing.join(", ")}` });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: "Please provide a valid email address" });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  next();
};

const validateFAQ = (req, res, next) => {
  const { question, answer, category } = req.body;
  const missing = [];

  if (!question) missing.push("question");
  if (!answer) missing.push("answer");
  if (!category) missing.push("category");

  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required field(s): ${missing.join(", ")}` });
  }

  next();
};

const validateTopic = (req, res, next) => {
  if (!req.body.topic) {
    return res.status(400).json({ message: "A 'topic' field is required" });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateFAQ, validateTopic };
