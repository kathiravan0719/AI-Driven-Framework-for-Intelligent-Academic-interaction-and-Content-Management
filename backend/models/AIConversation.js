const mongoose = require('mongoose');

const AIConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Chat',
    trim: true,
    maxlength: 100
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for performance
AIConversationSchema.index({ userId: 1, lastMessageAt: -1 });

module.exports = mongoose.model('AIConversation', AIConversationSchema);
