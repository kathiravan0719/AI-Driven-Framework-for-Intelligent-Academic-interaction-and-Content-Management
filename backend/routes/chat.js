const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const notificationService = require('../utils/notificationService');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/chat/conversations — list all conversations for the logged-in user
router.get('/conversations', auth, asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;

  // Find all unique users this user has exchanged messages with
  const sent = await Message.distinct('receiver', { sender: userId });
  const received = await Message.distinct('sender', { receiver: userId });

  const contactIds = [...new Set([...sent, ...received].map(id => id.toString()))];

  const conversations = [];

  for (const contactId of contactIds) {
    // Get the last message between the two users
    const lastMessage = await Message.findOne({
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId },
      ],
    }).sort({ createdAt: -1 });

    // Count unread messages from this contact
    const unreadCount = await Message.countDocuments({
      sender: contactId,
      receiver: userId,
      read: false,
    });

    // Get contact user info
    const contact = await User.findById(contactId, 'name email role');

    if (contact) {
      conversations.push({
        user: contact,
        lastMessage,
        unreadCount,
      });
    }
  }

  // Sort by last message time (newest first)
  conversations.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || 0;
    const bTime = b.lastMessage?.createdAt || 0;
    return new Date(bTime) - new Date(aTime);
  });

  res.json(conversations);
}));

// GET /api/chat/messages/:userId — get messages between logged-in user and target user
router.get('/messages/:userId', auth, asyncHandler(async (req, res, next) => {
  const myId = req.user.userId;
  const otherId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { sender: myId, receiver: otherId },
      { sender: otherId, receiver: myId },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(200);

  res.json(messages);
}));

// POST /api/chat/send — send a message
router.post('/send', auth, asyncHandler(async (req, res, next) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.userId;

  if (!receiverId || !content?.trim()) {
    return res.status(400).json({ error: 'Receiver and content are required' });
  }

  const message = new Message({
    sender: senderId,
    receiver: receiverId,
    content: content.trim(),
  });

  await message.save();

  // Emit real-time event via socket
  const io = req.app.get('io');
  if (io) {
    // Send to receiver's socket room
    io.to(`user-${receiverId}`).emit('chat-message', message);
  }

  // Unified Notification Ecosystem Call
  const sender = await User.findById(senderId, 'name');
  if (sender) {
    await notificationService.notifyUser(receiverId, {
      type: 'chat',
      title: `New Message from ${sender.name}`,
      message: content.length > 50 ? content.substring(0, 50) + '...' : content,
      link: `/chat/${senderId}`,
      senderId: senderId
    });
  }

  res.status(201).json(message);
}));

// PUT /api/chat/read/:userId — mark all messages from userId as read
router.put('/read/:userId', auth, asyncHandler(async (req, res, next) => {
  const myId = req.user.userId;
  const otherId = req.params.userId;

  await Message.updateMany(
    { sender: otherId, receiver: myId, read: false },
    { $set: { read: true } }
  );

  res.json({ success: true });
}));

// GET /api/chat/unread-count — get total unread message count
router.get('/unread-count', auth, asyncHandler(async (req, res, next) => {
  const count = await Message.countDocuments({
    receiver: req.user.userId,
    read: false,
  });
  res.json({ count });
}));

module.exports = router;
