import * as tf from '@tensorflow/tfjs';

class ContentModerator {
  constructor() {
    this.toxicWords = [
      'spam', 'abuse', 'hate', 'violent', 'offensive'
      // Add more based on your needs
    ];
  }

  // Check if content is appropriate
  checkContent(text) {
    const lowerText = text.toLowerCase();
    
    // Check for toxic words
    const hasToxicWords = this.toxicWords.some(word => 
      lowerText.includes(word)
    );

    // Check length
    const isTooShort = text.trim().length < 10;
    const isTooLong = text.length > 5000;

    // Check for spam patterns
    const hasExcessiveLinks = (text.match(/https?:\/\//g) || []).length > 3;
    const hasExcessiveCaps = (text.match(/[A-Z]/g) || []).length / text.length > 0.5;

    const score = {
      isSafe: !hasToxicWords && !hasExcessiveLinks && !hasExcessiveCaps,
      flags: {
        toxicWords: hasToxicWords,
        tooShort: isTooShort,
        tooLong: isTooLong,
        spam: hasExcessiveLinks || hasExcessiveCaps
      },
      confidence: hasToxicWords ? 0.9 : 0.1
    };

    return score;
  }

  // Get content suggestions
  getSuggestions(text) {
    const issues = [];
    const lowerText = text.toLowerCase();

    if (text.trim().length < 10) {
      issues.push('Content is too short. Please provide more details.');
    }

    if (text.length > 5000) {
      issues.push('Content is too long. Consider breaking it into multiple posts.');
    }

    const linkCount = (text.match(/https?:\/\//g) || []).length;
    if (linkCount > 3) {
      issues.push('Too many links detected. This might be considered spam.');
    }

    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.5) {
      issues.push('Excessive use of capital letters. Please use normal case.');
    }

    return issues;
  }

  // Auto-correct common mistakes
  autoCorrect(text) {
    let corrected = text;
    
    // Remove excessive spaces
    corrected = corrected.replace(/\s+/g, ' ').trim();
    
    // Fix common typos
    const corrections = {
      'teh': 'the',
      'taht': 'that',
      'recieve': 'receive',
      'occured': 'occurred'
    };

    Object.entries(corrections).forEach(([wrong, right]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, right);
    });

    return corrected;
  }
}

export default new ContentModerator();