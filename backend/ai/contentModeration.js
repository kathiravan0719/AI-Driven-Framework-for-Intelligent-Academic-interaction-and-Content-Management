const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

class ContentModerator {
  constructor() {
    this.toxicWords = [
      'spam', 'scam', 'fake', 'abuse', 'hate', 'violent', 'offensive',
      'inappropriate', 'harassment', 'bully', 'threat'
    ];

    this.spamPatterns = [
      /buy now/gi,
      /click here/gi,
      /limited offer/gi,
      /act fast/gi,
      /\$\$\$/g
    ];
  }

  moderateContent(content) {
    const issues = [];
    let qualityScore = 100;

    // Check length
    if (content.trim().length < 10) {
      issues.push({ type: 'length', severity: 'high', message: 'Content too short' });
      qualityScore -= 30;
    }

    if (content.length > 10000) {
      issues.push({ type: 'length', severity: 'medium', message: 'Content too long' });
      qualityScore -= 10;
    }

    // Check for toxic words
    const lowerContent = content.toLowerCase();
    const foundToxicWords = this.toxicWords.filter(word => lowerContent.includes(word));
    
    if (foundToxicWords.length > 0) {
      issues.push({
        type: 'toxic',
        severity: 'high',
        message: `Potentially toxic content detected: ${foundToxicWords.join(', ')}`,
        words: foundToxicWords
      });
      qualityScore -= foundToxicWords.length * 20;
    }

    // Check for spam patterns
    const spamMatches = this.spamPatterns.filter(pattern => pattern.test(content));
    if (spamMatches.length > 0) {
      issues.push({
        type: 'spam',
        severity: 'high',
        message: 'Spam patterns detected'
      });
      qualityScore -= 40;
    }

    // Check for excessive links
    const linkCount = (content.match(/https?:\/\//g) || []).length;
    if (linkCount > 3) {
      issues.push({
        type: 'links',
        severity: 'medium',
        message: 'Too many links'
      });
      qualityScore -= 15;
    }

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5 && content.length > 20) {
      issues.push({
        type: 'formatting',
        severity: 'low',
        message: 'Excessive use of capital letters'
      });
      qualityScore -= 10;
    }

    // Check for repetitive content
    const words = tokenizer.tokenize(lowerContent);
    const uniqueWords = new Set(words);
    const diversity = uniqueWords.size / words.length;
    
    if (diversity < 0.3 && words.length > 20) {
      issues.push({
        type: 'repetitive',
        severity: 'medium',
        message: 'Content appears repetitive'
      });
      qualityScore -= 20;
    }

    const isApproved = qualityScore >= 60 && issues.filter(i => i.severity === 'high').length === 0;

    return {
      isApproved,
      qualityScore: Math.max(0, qualityScore),
      issues,
      requiresReview: issues.some(i => i.severity === 'high')
    };
  }

  autoCorrect(content) {
    let corrected = content;

    // Remove excessive spaces
    corrected = corrected.replace(/\s+/g, ' ').trim();

    // Remove excessive newlines
    corrected = corrected.replace(/\n{3,}/g, '\n\n');

    // Common typo corrections
    const corrections = {
      'teh': 'the',
      'taht': 'that',
      'recieve': 'receive',
      'occured': 'occurred',
      'seperate': 'separate',
      'definate': 'definite',
      'wierd': 'weird',
      'untill': 'until'
    };

    Object.entries(corrections).forEach(([wrong, right]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, right);
    });

    return corrected;
  }

  getSuggestions(content) {
    const suggestions = [];

    if (content.trim().length < 50) {
      suggestions.push('Add more details to make your post more informative');
    }

    const questionMarkCount = (content.match(/\?/g) || []).length;
    if (questionMarkCount === 0 && content.length > 100) {
      suggestions.push('Consider asking a question to encourage discussion');
    }

    const words = tokenizer.tokenize(content.toLowerCase());
    if (words.length > 20) {
      suggestions.push('Consider breaking long content into paragraphs for better readability');
    }

    return suggestions;
  }
}

module.exports = new ContentModerator();