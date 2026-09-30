const jwt = require("jsonwebtoken");

// Creates a signed JWT for a given user id, valid for 7 days
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Shapes a Mongoose user document into the safe object we send back to clients
// (never includes the password, even if it was accidentally selected)
const formatUserResponse = (user, token) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  };
};

// Strips markdown code fences (```json ... ```) that Gemini sometimes wraps
// around JSON responses, so JSON.parse doesn't fail
const cleanAIJsonResponse = (rawText) => {
  return rawText.replace(/```json|```/g, "").trim();
};

module.exports = { generateToken, formatUserResponse, cleanAIJsonResponse };
