const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const auth = require("../middleware/auth");
const aiService = require("../utils/aiService");
const asyncHandler = require("../middleware/asyncHandler");
const { createNotification } = require("../utils/notificationHelper");

// GET all posts
router.get("/", asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ isApproved: true })
    .populate('userId', 'name email avatar role')
    .sort({ createdAt: -1 });
  res.json(posts);
}));

// POST create a post
router.post("/", auth, asyncHandler(async (req, res, next) => {
  const { title, content, tags, category } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const post = new Post({
    userId: req.user.userId,
    title,
    content,
    tags: tags || [],
    category: category || 'General'
  });

  // Generate AI Embedding for search
  const textToEmbed = `${title} ${content}`;
  post.embedding = await aiService.getEmbedding(textToEmbed);

  await post.save();
  
  const populatedPost = await Post.findById(post._id).populate('userId', 'name email avatar role');

  // Emit real-time event if io is available
  const io = req.app.get('io');
  if (io) io.emit('new-post', populatedPost);

  res.status(201).json(populatedPost);
}));

// PUT like a post
router.put("/:id/like", auth, asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const likeIndex = post.likedBy.indexOf(userId);
  if (likeIndex === -1) {
    post.likedBy.push(userId);
    post.likes += 1;
  } else {
    post.likedBy.splice(likeIndex, 1);
    post.likes -= 1;
  }

  await post.save();
  const updatedPost = await Post.findById(post._id).populate('userId', 'name email avatar role');

  const io = req.app.get('io');
  if (io) io.emit('post-liked', updatedPost);

  // Trigger Notification for the author
  if (likeIndex === -1) { // Only notify on LIKE, not unlike
      const sender = await User.findById(userId);
      await createNotification(req.app, {
          recipient: post.userId,
          sender: userId,
          type: 'post_interaction',
          title: 'Post Liked',
          message: `${sender?.name || 'Someone'} appreciated your knowledge stream: "${post.title}"`,
          link: `/post/${post._id}`
      });
  }

  res.json(updatedPost);
}));

// POST comment on a post
router.post("/:id/comment", auth, asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content) return res.status(400).json({ error: "Comment content required" });

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const comment = { userId, content };
  
  // Generate embedding for comment search
  if (content.trim().length > 5) {
    comment.embedding = await aiService.getEmbedding(content);
  }

  post.comments.push(comment);
  await post.save();

  const updatedPost = await Post.findById(post._id).populate('userId', 'name email avatar role').populate('comments.userId', 'name avatar');

  const io = req.app.get('io');
  if (io) io.emit('new-comment', updatedPost);

  // Trigger Notification for the author
  const sender = await User.findById(userId);
  await createNotification(req.app, {
      recipient: post.userId,
      sender: userId,
      type: 'post_interaction',
      title: 'New Comment',
      message: `${sender?.name || 'Someone'} commented on your post: "${post.title}"`,
      link: `/post/${post._id}`
  });

  res.json(updatedPost);
}));

// DELETE a post
router.delete("/:id", auth, asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  // Only creator or admin can delete
  if (post.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: "Unauthorized" });
  }

  await Post.findByIdAndDelete(req.params.id);

  const io = req.app.get('io');
  if (io) io.emit('post-deleted', req.params.id);

  res.json({ success: true });
}));

module.exports = router;