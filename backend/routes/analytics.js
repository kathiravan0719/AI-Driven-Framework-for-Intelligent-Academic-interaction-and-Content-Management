const express = require('express');
const router = express.Router();

const Analytics = require("../models/Analytics");
const Post = require("../models/Post");
const User = require('../models/User');
const analyticsProcessor = require("../ai/analytics");
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

// Track event
router.post("/track", asyncHandler(async (req, res, next) => {
    const { type, userId, postId, metadata } = req.body;

    const analyticsEntry = new Analytics({
      type,
      userId,
      postId,
      metadata,
    });

    await analyticsEntry.save();
    res.json({ success: true });
}));

// Get platform statistics
router.get("/stats", auth, asyncHandler(async (req, res, next) => {
    const posts = await Post.find();
    const users = await User.find();

    const stats = analyticsProcessor.generatePlatformStats(posts, users);
    const timeline = analyticsProcessor.generateActivityTimeline(posts, 7);

    res.json({
      ...stats,
      activityData: timeline,
    });
}));

// Get user analytics
router.get("/user/:userId", auth, asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find();
    const userAnalytics = analyticsProcessor.analyzeUserActivity(
      user,
      posts,
      []
    );

    res.json(userAnalytics);
}));

// Get post analytics
router.get("/post/:postId", asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const engagement = analyticsProcessor.calculateEngagementRate(post);

    const views = await Analytics.countDocuments({
      type: "pageview",
      postId: req.params.postId,
    });

    res.json({
      ...engagement,
      views,
      createdAt: post.createdAt,
      sentiment: post.sentiment,
    });
}));

module.exports = router;
