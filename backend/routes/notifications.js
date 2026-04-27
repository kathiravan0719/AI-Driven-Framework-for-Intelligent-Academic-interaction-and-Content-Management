const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// Get all notifications for the logged-in user
router.get('/', auth, asyncHandler(async (req, res, next) => {
    const notifications = await Notification.find({ recipient: req.user.userId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
}));

// Mark a notification as read
router.put('/:id/read', auth, asyncHandler(async (req, res, next) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
}));

// Mark ALL notifications as read
router.put('/read-all', auth, asyncHandler(async (req, res, next) => {
    await Notification.updateMany(
      { recipient: req.user.userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
}));

module.exports = router;
