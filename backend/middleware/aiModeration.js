const contentModerator = require('../ai/contentModeration');
const sentimentAnalyzer = require('../ai/sentimentAnalysis');
const nlpProcessor = require('../ai/nlpProcessor');

const aiModeration = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const fullText = `${title || ''} ${content || ''}`;

    // Check if content needs moderation
    if (!fullText.trim()) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }

    // Run AI moderation
    const moderation = contentModerator.moderateContent(fullText);
    const sentiment = sentimentAnalyzer.analyze(fullText);

    // Add AI results to request
    req.aiModeration = {
      isApproved: moderation.isApproved,
      qualityScore: moderation.qualityScore,
      sentiment: sentiment.sentiment,
      sentimentScore: sentiment.score,
      issues: moderation.issues
    };

    // If content has high severity issues, reject it
    if (moderation.requiresReview) {
      return res.status(400).json({
        error: 'Content requires review',
        issues: moderation.issues,
        suggestions: contentModerator.getSuggestions(fullText)
      });
    }

    // Auto-generate tags if not provided
    if (!req.body.tags || req.body.tags.length === 0) {
      req.body.tags = nlpProcessor.generateTags(fullText, 5);
    }

    // Suggest category if not provided
    if (!req.body.category) {
      const categoryResult = nlpProcessor.categorizeContent(fullText);
      req.body.category = categoryResult.category;
    }

    next();
  } catch (error) {
    console.error('AI Moderation error:', error);
    next(); // Continue even if moderation fails
  }
};

module.exports = aiModeration;