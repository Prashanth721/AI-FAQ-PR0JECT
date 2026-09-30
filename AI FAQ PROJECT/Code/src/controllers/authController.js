const User = require("../models/User");
const { generateToken, formatUserResponse } = require("../utils/helpers");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json(formatUserResponse(user, token));
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @desc    Log in an existing user
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    res.status(200).json(formatUserResponse(user, token));
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser };
