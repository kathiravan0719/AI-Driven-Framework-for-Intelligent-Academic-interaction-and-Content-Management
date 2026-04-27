const natural = require('natural');
const compromise = require('compromise');

class NLPProcessor {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.classifier = new natural.BayesClassifier();
  }

  // Extract keywords from text
  extractKeywords(text, limit = 10) {
    const doc = compromise(text);
    
    // Extract nouns and noun phrases
    const nouns = doc.nouns().out('array');
    const topics = doc.topics().out('array');
    
    // Combine and deduplicate
    const keywords = [...new Set([...nouns, ...topics])]
      .filter(word => word.length > 3)
      .slice(0, limit);

    return keywords;
  }

  // Categorize content
  categorizeContent(text) {
    const doc = compromise(text);
    const lowerText = text.toLowerCase();

    // Tech indicators
    const techKeywords = ['code', 'programming', 'software', 'technology', 'computer', 'ai', 'ml', 'data'];
    const hasTech = techKeywords.some(kw => lowerText.includes(kw));

    // Academic indicators
    const academicKeywords = ['study', 'exam', 'course', 'assignment', 'lecture', 'professor', 'class'];
    const hasAcademic = academicKeywords.some(kw => lowerText.includes(kw));

    // Event indicators
    const eventKeywords = ['event', 'meeting', 'seminar', 'workshop', 'conference', 'fest'];
    const hasEvent = eventKeywords.some(kw => lowerText.includes(kw));

    // Career indicators
    const careerKeywords = ['job', 'internship', 'placement', 'interview', 'career', 'company'];
    const hasCareer = careerKeywords.some(kw => lowerText.includes(kw));

    // Determine category
    const scores = {
      Tech: hasTech ? 1 : 0,
      Academic: hasAcademic ? 1 : 0,
      Events: hasEvent ? 1 : 0,
      Career: hasCareer ? 1 : 0,
      General: 0.5
    };

    const category = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0][0];

    return {
      category,
      confidence: Math.max(...Object.values(scores)),
      allScores: scores
    };
  }

  // Generate tags from content
  generateTags(text, limit = 5) {
    const keywords = this.extractKeywords(text, limit * 2);
    
    // Filter out common words
    const stopwords = ['this', 'that', 'these', 'those', 'what', 'which'];
    const tags = keywords
      .filter(word => !stopwords.includes(word.toLowerCase()))
      .slice(0, limit);

    return tags;
  }

  // Summarize text
  summarize(text, maxLength = 150) {
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    
    if (text.length <= maxLength) {
      return text;
    }

    // Take first few sentences that fit within maxLength
    let summary = '';
    for (const sentence of sentences) {
      if ((summary + sentence).length <= maxLength) {
        summary += sentence;
      } else {
        break;
      }
    }

    return summary.trim() || sentences[0].substring(0, maxLength) + '...';
  }

  // Detect language
  detectLanguage(text) {
    // Simple English detection (can be extended)
    const englishWords = ['the', 'is', 'are', 'was', 'were', 'a', 'an'];
    const words = this.tokenizer.tokenize(text.toLowerCase());
    
    const englishCount = words.filter(word => 
      englishWords.includes(word)
    ).length;

    return {
      language: englishCount > 2 ? 'en' : 'unknown',
      confidence: Math.min(englishCount / 10, 1)
    };
  }

  // Check readability
  calculateReadability(text) {
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const words = this.tokenizer.tokenize(text);
    const syllables = words.reduce((count, word) => {
      return count + this.countSyllables(word);
    }, 0);

    if (sentences.length === 0 || words.length === 0) {
      return { score: 0, level: 'N/A' };
    }

    // Flesch Reading Ease
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    let level = 'Very Difficult';
    if (score >= 90) level = 'Very Easy';
    else if (score >= 80) level = 'Easy';
    else if (score >= 70) level = 'Fairly Easy';
    else if (score >= 60) level = 'Standard';
    else if (score >= 50) level = 'Fairly Difficult';
    else if (score >= 30) level = 'Difficult';

    return {
      score: Math.max(0, Math.min(100, score)),
      level,
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      avgSyllablesPerWord: avgSyllablesPerWord.toFixed(2)
    };
  }

  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  }

  // Extract entities (names, places, etc.)
  extractEntities(text) {
    const doc = compromise(text);
    
    return {
      people: doc.people().out('array'),
      places: doc.places().out('array'),
      organizations: doc.organizations().out('array'),
      dates: doc.dates().out('array')
    };
  }
}

module.exports = new NLPProcessor();