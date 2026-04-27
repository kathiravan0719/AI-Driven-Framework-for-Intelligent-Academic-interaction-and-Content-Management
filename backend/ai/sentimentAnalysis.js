const Sentiment = require('sentiment');
const sentiment = new Sentiment();

class SentimentAnalyzer {
  analyze(text) {
    if (!text || text.trim().length === 0) {
      return {
        sentiment: 'neutral',
        score: 0,
        positive: 0,
        negative: 0,
        confidence: 0
      };
    }

    const result = sentiment.analyze(text);

    let sentimentLabel = 'neutral';
    if (result.score > 2) sentimentLabel = 'positive';
    else if (result.score < -2) sentimentLabel = 'negative';

    return {
      sentiment: sentimentLabel,
      score: result.score,
      positive: result.positive.length,
      negative: result.negative.length,
      confidence: Math.min(Math.abs(result.score) / 10, 1),
      comparative: result.comparative,
      tokens: result.tokens
    };
  }

  analyzeBatch(texts) {
    return texts.map(text => this.analyze(text));
  }

  getAverageSentiment(texts) {
    const analyses = this.analyzeBatch(texts);
    const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
    
    let sentiment = 'neutral';
    if (avgScore > 0.5) sentiment = 'positive';
    else if (avgScore < -0.5) sentiment = 'negative';

    return {
      sentiment,
      averageScore: avgScore,
      total: analyses.length
    };
  }
}

module.exports = new SentimentAnalyzer();