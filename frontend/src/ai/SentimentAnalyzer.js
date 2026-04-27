class SentimentAnalyzer {
  constructor() {
    this.positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'love', 'best', 'awesome', 'brilliant', 'perfect', 'happy',
      'helpful', 'thanks', 'appreciate', 'grateful'
    ];

    this.negativeWords = [
      'bad', 'terrible', 'awful', 'hate', 'worst', 'horrible',
      'disappointing', 'poor', 'useless', 'waste', 'frustrating',
      'angry', 'sad', 'upset', 'annoying'
    ];
  }

  analyze(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (this.positiveWords.includes(word)) positiveCount++;
      if (this.negativeWords.includes(word)) negativeCount++;
    });

    const totalSentimentWords = positiveCount + negativeCount;
    
    let sentiment = 'neutral';
    let score = 0;

    if (totalSentimentWords > 0) {
      score = (positiveCount - negativeCount) / totalSentimentWords;
      
      if (score > 0.2) sentiment = 'positive';
      else if (score < -0.2) sentiment = 'negative';
    }

    return {
      sentiment,
      score,
      positive: positiveCount,
      negative: negativeCount,
      confidence: totalSentimentWords > 0 ? 0.8 : 0.3
    };
  }

  getEmoji(sentiment) {
    const emojis = {
      positive: '😊',
      neutral: '😐',
      negative: '😞'
    };
    return emojis[sentiment] || '😐';
  }

  getColor(sentiment) {
    const colors = {
      positive: 'text-green-600',
      neutral: 'text-gray-600',
      negative: 'text-red-600'
    };
    return colors[sentiment] || 'text-gray-600';
  }
}

export default new SentimentAnalyzer();