const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  sentimentScore: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  embedding: {
    type: [Number],
    default: []
  }
});

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    default: 'General',
    enum: ['Tech', 'General', 'Announcements', 'Clubs', 'Events', 'Academic', 'Career']
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema],
  views: {
    type: Number,
    default: 0
  },
  // AI-related fields
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  sentimentScore: {
    type: Number,
    default: 0
  },
  contentQuality: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  aiModerated: {
    type: Boolean,
    default: false
  },
  moderationFlags: [{
    reason: String,
    timestamp: Date
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  embedding: {
    type: [Number],
    default: []
  }
});

// Update timestamp on save
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better search performance
PostSchema.index({ title: 'text', content: 'text', tags: 'text' });
PostSchema.index({ category: 1, timestamp: -1 });
PostSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Post', PostSchema);