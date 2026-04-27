const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Content = require('../models/Content');
const User = require('../models/User');
const AIMessage = require('../models/AIMessage');
const asyncHandler = require('../middleware/asyncHandler');

// Middleware to check for Admin role
const requireAdmin = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
});

// GET overall admin stats
router.get('/stats', auth, requireAdmin, asyncHandler(async (req, res, next) => {
    const { range } = req.query; // '7d', '30d', 'all'
    let dateFilter = {};
    
    if (range === '7d') {
        dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (range === '30d') {
        dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const totalUsers = await User.countDocuments(dateFilter);
    const aiQueries = await AIMessage.countDocuments(dateFilter);
    
    const pipelineMatch = Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : [];

    // Aggregate content stats
    const contentStats = await Content.aggregate([
        ...pipelineMatch,
        {
            $group: {
                _id: null,
                totalContent: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalDownloads: { $sum: "$downloadCount" }
            }
        }
    ]);

    // Distribution of Content per Category
    const categoryDistribution = await Content.aggregate([
        ...pipelineMatch,
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                name: "$_id",
                value: "$count",
                _id: 0
            }
        }
    ]);

    const stats = contentStats[0] || { totalContent: 0, totalViews: 0, totalDownloads: 0 };
    
    // Check online users if socket mapping exists on app
    const onlineUsersObj = req.app.get('onlineUsers') || {};
    const activeUsers = Object.keys(onlineUsersObj).length;

    // Optionally, check active users based on recent login (if tracked) or fallback to onlineUsers
    res.json({
        totalContent: stats.totalContent,
        totalViews: stats.totalViews || 0,
        totalDownloads: stats.totalDownloads || 0,
        activeUsers: activeUsers > 0 ? activeUsers : 1, // Fallback to 1 if testing alone
        totalUsers,
        aiQueries,
        categoryDistribution
    });
}));

// GET top performing content
router.get('/top-content', auth, requireAdmin, asyncHandler(async (req, res, next) => {
    const topContent = await Content.find()
        .sort({ views: -1, downloadCount: -1 })
        .limit(5)
        .select('title subject category views downloadCount type createdAt');
        
    res.json(topContent);
}));

// GET audit logs (with pagination and filters)
router.get('/audit-logs', auth, requireAdmin, asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, actionType, severity, search } = req.query;
    let query = {};
    
    if (actionType && actionType !== 'All') {
        query.actionType = actionType;
    }
    if (severity && severity !== 'All') {
        query.severity = severity;
    }
    if (search) {
        query.$or = [
            { adminName: { $regex: search, $options: 'i' } },
            { 'metadata.targetTitle': { $regex: search, $options: 'i' } },
            { 'metadata.targetName': { $regex: search, $options: 'i' } },
            { 'metadata.targetEmail': { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const AuditLog = require('../models/AuditLog');
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    res.json({
        logs,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
    });
}));

module.exports = router;
