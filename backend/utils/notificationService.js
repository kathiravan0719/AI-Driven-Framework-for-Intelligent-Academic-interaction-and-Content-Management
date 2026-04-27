const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('./emailService');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Send real-time notification to user, save to DB, and send Email
  async notifyUser(userId, payload) {
    try {
      const { type, title, message, link, senderId } = payload;
      
      const newNotification = new Notification({
        recipient: userId,
        sender: senderId || null,
        type: type || 'system',
        title,
        message,
        link
      });
      await newNotification.save();

      // Emit to online user
      this.io.to(`user-${userId}`).emit("new-notification", newNotification);

      // Fetch user to get email Address
      const recipient = await User.findById(userId);
      if (recipient) {
         await emailService.sendNotificationEmail(recipient, { title, subject: 'New Alert in College CMS', message, link });
      }
    } catch (e) {
      console.error('Notification dispatch failed', e);
    }
  }

  // Broadcast to all users
  async broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Notify about new post
  notifyNewPost(post) {
    this.broadcast("new-post", post);
  }

  // Notify about new comment
  notifyNewComment(postId, comment) {
    this.io.to(`post-${postId}`).emit("new-comment", {
      postId,
      comment,
    });
  }

  // Notify post author about interaction
  notifyPostAuthor(authorId, notification) {
    this.notifyUser(authorId, {
      type: "interaction",
      ...notification,
      timestamp: Date.now(),
    });
  }

  // System notification
  sendSystemNotification(message, type = "info") {
    this.broadcast("system-notification", {
      type,
      message,
      timestamp: Date.now(),
    });
  }
}

module.exports = NotificationService;
