const express = require("express");
const router = express.Router();
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

// GET all users (public basic info)
router.get("/", asyncHandler(async (req, res, next) => {
    const users = await User.find({}, "-password");
    res.json(users);
}));

// Middleware to check for Admin role
const adminOnly = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.userId);
    if (user && user.role === 'admin') {
      req.adminUser = user;
      next();
    } else {
      res.status(403).json({ error: "Access denied. Admin only." });
    }
});

// PUT change user role
router.put("/:id/role", auth, adminOnly, asyncHandler(async (req, res, next) => {
    const { role } = req.body;
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) return res.status(404).json({ error: "User not found" });

    const oldRole = userToUpdate.role;
    userToUpdate.role = role;
    await userToUpdate.save();

    await AuditLog.create({
      adminId: req.adminUser._id,
      adminName: req.adminUser.name,
      adminEmail: req.adminUser.email,
      actionType: 'UPDATE_ROLE',
      severity: role === 'admin' ? 'high' : 'medium',
      targetType: 'USER',
      targetId: userToUpdate._id,
      metadata: { oldRole, newRole: role, targetName: userToUpdate.name, targetEmail: userToUpdate.email }
    });

    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
}));

// PUT update own profile (bio/skills)
router.put("/profile", auth, asyncHandler(async (req, res, next) => {
    const { bio, skills } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());

    // Generate Profile Embedding for Expert Search
    const profileText = `${user.name} ${user.bio || ''} skills: ${(user.skills || []).join(', ')}`;
    if (profileText.trim().length > 10) {
      user.embedding = await aiService.getEmbedding(profileText);
    }

    await user.save();
    res.json({ success: true, user: { id: user._id, name: user.name, bio: user.bio, skills: user.skills } });
}));

// DELETE a user
router.delete("/:id", auth, adminOnly, asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await AuditLog.create({
      adminId: req.adminUser._id,
      adminName: req.adminUser.name,
      adminEmail: req.adminUser.email,
      actionType: 'DELETE_USER',
      severity: 'high',
      targetType: 'USER',
      targetId: user._id,
      metadata: { targetName: user.name, targetEmail: user.email, targetRole: user.role }
    });

    res.json({ success: true, message: "User deleted successfully" });
}));

module.exports = router;