const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  postId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Analytics", AnalyticsSchema);