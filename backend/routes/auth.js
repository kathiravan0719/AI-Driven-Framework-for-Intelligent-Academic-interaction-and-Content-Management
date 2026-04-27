const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const auth = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");
const asyncHandler = require("../middleware/asyncHandler");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ error: "Email already registered" });
  }

  // Create new user (Role normalization is handled by default and enum in User.js)
  user = new User({
    name,
    email,
    password,
    role: role || "student",
  });

  await user.save();

  // Create JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  // Send welcome email asynchronously (don't block response)
  try {
    await sendEmail.welcome({ name: user.name, email: user.email, role: user.role });
  } catch (emailErr) {
    console.log("Welcome email failed (non-critical):", emailErr.message);
  }
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists (include password field)
  // Ensure email is trimmed and normalized
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Create JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return res.status(404).json({ error: "No user found with this email" });
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Email message
  const message = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset for your AI College CMS account.</p>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
    <p>Or copy and paste this link into your browser:</p>
    <p>${resetUrl}</p>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request - AI College CMS",
      html: message,
    });

    res.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (emailError) {
    // Reset token fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Detailed error logging as requested
    console.error("\n❌ Forgot Password SMTP Failure:");
    console.error(`❌ Recipient: ${user.email}`);
    console.error(`❌ Message: ${emailError.message}`);
    if (emailError.code) console.error(`❌ SMTP Code: ${emailError.code}`);
    if (emailError.response) console.error(`❌ SMTP Response: ${emailError.response}`);

    return res.status(500).json({
      error: "Email could not be sent. Please try again later.",
    });
  }
}));

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post("/reset-password/:token", asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  // Hash the token from URL
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      error: "Invalid or expired reset token",
    });
  }

  // Validate password
  if (!password || password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters long",
    });
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // Create JWT token for automatic login
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    message: "Password reset successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}));

module.exports = router;