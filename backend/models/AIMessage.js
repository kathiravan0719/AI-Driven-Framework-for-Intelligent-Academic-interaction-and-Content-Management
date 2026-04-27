const mongoose = require('mongoose');

const AIMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIConversation',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  sources: [
    {
      type: { type: String }, // 'content', 'event', 'post'
      title: { type: String },
      documentId: { type: mongoose.Schema.Types.ObjectId },
      filename: { type: String },
      icon: { type: String },
      metadata: { type: mongoose.Schema.Types.Mixed }
    }
  ],
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for conversation performance
AIMessageSchema.index({ conversationId: 1, timestamp: 1 });

module.exports = mongoose.model('AIMessage', AIMessageSchema);
