const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// helper: generate token
const genToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// @desc Register
// @route POST /api/auth/register
// @access Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, employeeId, department } = req.body;
  if (!name || !email || !password || !employeeId) {
    res.status(400);
    throw new Error('Please provide name, email, password, employeeId');
  }
  const exists = await User.findOne({ $or: [{ email }, { employeeId }] });
  if (exists) {
    res.status(400);
    throw new Error('User with email or employeeId already exists');
  }
  const user = await User.create({ name, email, password, role, employeeId, department });
  const token = genToken(user._id);
  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department
    },
    token
  });
});

// @desc Login
// @route POST /api/auth/login
// @access Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    const token = genToken(user._id);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department
      },
      token
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc Get logged user
// @route GET /api/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  res.json(user);
});