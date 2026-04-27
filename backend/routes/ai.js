const express = require('express');
const router = express.Router();
const contentModerator = require('../ai/contentModeration');
const sentimentAnalyzer = require('../ai/sentimentAnalysis');
const recommendationEngine = require('../ai/recommendation');
const nlpProcessor = require('../ai/nlpProcessor');
const Post = require('../models/Post');
const Event = require('../models/Event');
const Content = require('../models/Content');
const User = require('../models/User');
const AIConversation = require('../models/AIConversation');
const AIMessage = require('../models/AIMessage');
const auth = require('../middleware/auth');
const aiService = require('../utils/aiService');
const asyncHandler = require('../middleware/asyncHandler');

// Moderate content
router.post('/moderate', asyncHandler(async (req, res, next) => {
    const { content } = req.body;
    
    const moderation = contentModerator.moderateContent(content);
    const sentiment = sentimentAnalyzer.analyze(content);
    const keywords = nlpProcessor.extractKeywords(content);
    const suggestedTags = nlpProcessor.generateTags(content);
    const category = nlpProcessor.categorizeContent(content);

    res.json({
      moderation,
      sentiment,
      keywords,
      suggestedTags,
      suggestedCategory: category.category
    });
}));

// Dedicated LLM-powered RAG Chat with Persistence
router.post('/chat', auth, asyncHandler(async (req, res, next) => {
    const { message, conversationId, documentId } = req.body;
    const userId = req.user.userId;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    console.log("💬 AI Chat processing query:", message);

    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, userId });
      if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    } else {
      // Create new conversation
      conversation = new AIConversation({
        userId,
        title: message.substring(0, 40) + (message.length > 40 ? '...' : '')
      });
      await conversation.save();
    }

    // Save user message
    const userMsg = new AIMessage({
      conversationId: conversation._id,
      role: 'user',
      content: message
    });
    await userMsg.save();

    let contextText = 'No specific campus records or documents found related to this topic.';
    let sources = [];

    if (documentId) {
      // 1. Context-locked execution via direct RAG bypass
      const focusDoc = await Content.findById(documentId);
      if (focusDoc) {
        const docContent = focusDoc.extractedText || '';

        if (docContent.trim().length > 50) {
          // Full RAG: use extracted text
          contextText = `[FOCUS DOCUMENT: ${focusDoc.title}]\n${docContent}`;
        } else {
          // Document has no extractable text — inform user clearly
          contextText = `[DOCUMENT TITLE: ${focusDoc.title}]
[NOTE: The content of this file could not be fully extracted for AI analysis. This can happen with:
  - Files uploaded before text extraction was enabled
  - Scanned images in PPT/PDF with no selectable text
  - Unsupported file types like ZIP or image-only files]
[AVAILABLE INFO: ${focusDoc.description || 'No description provided.'}]`;
        }

        sources = [{
          type: 'content',
          title: focusDoc.title,
          documentId: focusDoc._id,
          filename: focusDoc.filename || null,
          icon: 'file-text'
        }];
      } else {
        return res.status(404).json({ error: 'Document not found' });
      }
    } else {
      // 1. Convert user's question into an embedding vector
      const embeddedQuery = await aiService.getEmbedding(message);

      // 2. Perform Parallel Vector Search across all Knowledge Collections
      const searchResults = await Promise.all([
        aiService.searchSimilarDocuments(embeddedQuery, Content, 3),
        aiService.searchSimilarDocuments(embeddedQuery, Event, 2),
        aiService.searchSimilarDocuments(embeddedQuery, Post, 3),
        aiService.searchSimilarDocuments(embeddedQuery, User, 2) // Search for experts/profiles
      ]);

      // Flatten and rank the most relevant items across all collections
      // Top-K filtering: Take top 6 most relevant across everything
      const allMatches = searchResults.flat().sort((a, b) => b.similarityScore - a.similarityScore);
      const topMatches = allMatches.slice(0, 6); 

      if (topMatches.length > 0) {
        contextText = topMatches.map(match => {
          const type = match.collectionName;
          const title = match.title || match.name || "Untitled Record";
          const text = match.extractedText || match.description || match.content || match.bio || '';
          
          // If it's a User, also include skills
          const skillsInfo = match.skills && match.skills.length > 0 ? `Skills: ${match.skills.join(', ')}` : '';
          
          return `[Source: ${type} | Identity: ${title}]\n${text}\n${skillsInfo}`;
        }).join('\n\n---\n\n');

        sources = topMatches.map(match => ({
          type: match.collectionName.toLowerCase(),
          title: match.title || match.name,
          documentId: match._id,
          filename: match.filename || null,
          icon: match.collectionName === 'Event' ? 'calendar' : 
                match.collectionName === 'Post' ? 'message-square' : 
                match.collectionName === 'User' ? 'user' : 'file-text'
        }));
      }
    }

    // 3. Generate response using the extracted Universal Context
    const aiResponseText = await aiService.queryWithContext(message, contextText);

    // Save AI message
    const aiMsg = new AIMessage({
      conversationId: conversation._id,
      role: 'assistant',
      content: aiResponseText,
      sources
    });
    await aiMsg.save();

    // Update conversation timestamp
    conversation.lastMessageAt = Date.now();
    await conversation.save();

    res.json({
      conversationId: conversation._id,
      messageId: aiMsg._id,
      content: aiResponseText,
      sources: sources,
      timestamp: aiMsg.timestamp
    });
}));

// Get user's AI chat history
router.get('/history', auth, asyncHandler(async (req, res, next) => {
    const conversations = await AIConversation.find({ userId: req.user.userId })
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
}));

// Get messages for a specific conversation
router.get('/conversation/:id', auth, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const conversation = await AIConversation.findOne({ _id: id, userId: req.user.userId });
    
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const messages = await AIMessage.find({ conversationId: id }).sort({ timestamp: 1 });
    res.json({
      conversation,
      messages
    });
}));

// Delete a conversation
router.delete('/conversation/:id', auth, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const conversation = await AIConversation.findOneAndDelete({ _id: id, userId: req.user.userId });
    
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    // Delete all messages associated with this conversation
    await AIMessage.deleteMany({ conversationId: id });

    res.json({ success: true, message: 'Conversation deleted' });
}));

// Rename a conversation
router.patch('/conversation/:id', auth, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const conversation = await AIConversation.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { title },
      { new: true }
    );
    
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    res.json(conversation);
}));

// Get Contextual Recommendations based on user history tracking
router.get('/recommendations/:userId', asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // 1. Grab user interaction history
    const user = await User.findById(userId);
    let preferredCategory = null;

    if (user && user.activityHistory && user.activityHistory.length > 0) {
      // Derive most frequent category interacted with
      const frequencies = {};
      user.activityHistory.forEach(act => {
        if (act.tag) {
          frequencies[act.tag] = (frequencies[act.tag] || 0) + 1;
        }
      });
      preferredCategory = Object.keys(frequencies).reduce((a, b) => frequencies[a] > frequencies[b] ? a : b, null);
    }

    // 2. Highly prioritize Content Documents (Notes, PDFs) over Posts based on the active interest!
    let contentQuery = { isApproved: true };
    let postQuery = { isApproved: true };
    
    if (preferredCategory) {
      contentQuery.category = preferredCategory;
      postQuery.category = preferredCategory;
    }

    // Attempt to grab hyper-relevant documents
    const recommendedContent = await Content.find(contentQuery)
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit * 0.7)); // 70% focus on Content Hub items

    // Fill the remainder with related community Forum Posts
    const recommendedPosts = await Post.find(postQuery)
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit - recommendedContent.length);

    res.json({
      contentRecommendations: recommendedContent,
      postRecommendations: recommendedPosts,
      identifiedInterest: preferredCategory || "General"
    });
}));

// Get similar posts
router.get('/similar/:postId', asyncHandler(async (req, res, next) => {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    const currentPost = await Post.findById(postId);
    if (!currentPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const allPosts = await Post.find({ 
      isApproved: true,
      _id: { $ne: postId }
    })
      .populate('userId', 'name email avatar')
      .limit(50);

    const similarPosts = recommendationEngine.getSimilarPosts(
      currentPost,
      allPosts,
      limit
    );

    res.json(similarPosts);
}));

// Track user interaction
router.post('/track', auth, asyncHandler(async (req, res, next) => {
    const { postId, actionType } = req.body;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    recommendationEngine.trackUserBehavior(
      userId,
      postId,
      actionType,
      {
        category: post.category,
        tags: post.tags
      }
    );

    res.json({ success: true });
}));

// Get user interest profile
router.get('/profile/:userId', asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const profile = recommendationEngine.getUserProfile(userId);

    if (!profile) {
      return res.json({ 
        message: 'No profile data yet',
        totalInteractions: 0 
      });
    }

    res.json(profile);
}));

// Analyze content
router.post('/analyze', asyncHandler(async (req, res, next) => {
    const { content } = req.body;

    const sentiment = sentimentAnalyzer.analyze(content);
    const keywords = nlpProcessor.extractKeywords(content);
    const readability = nlpProcessor.calculateReadability(content);
    const entities = nlpProcessor.extractEntities(content);
    const summary = nlpProcessor.summarize(content);

    res.json({
      sentiment,
      keywords,
      readability,
      entities,
      summary
    });
}));

// Get flagged content (admin only)
router.get('/flagged-content', auth, asyncHandler(async (req, res, next) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const flaggedPosts = await Post.find({
      $or: [
        { isApproved: false },
        { 'moderationFlags.0': { $exists: true } }
      ]
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(flaggedPosts);
}));

// Delete flagged content (admin only)
router.delete('/flagged-content/:id', auth, asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content removed' });
}));

module.exports = router;