const natural = require('natural');
const TfIdf = natural.TfIdf;

class RecommendationEngine {
  constructor() {
    this.tfidf = new TfIdf();
    this.userInterests = new Map();
  }

  // Build recommendation model from posts
  buildModel(posts) {
    this.tfidf = new TfIdf();
    
    posts.forEach(post => {
      const document = `${post.title} ${post.content} ${post.tags?.join(' ')}`;
      this.tfidf.addDocument(document);
    });
  }

  // Track user behavior
  trackUserBehavior(userId, postId, actionType, postData) {
    if (!this.userInterests.has(userId)) {
      this.userInterests.set(userId, {
        viewedPosts: [],
        likedPosts: [],
        commentedPosts: [],
        categories: {},
        tags: {},
        lastActive: Date.now()
      });
    }

    const interests = this.userInterests.get(userId);

    // Update based on action type
    switch(actionType) {
      case 'view':
        interests.viewedPosts.push({ postId, timestamp: Date.now() });
        break;
      case 'like':
        interests.likedPosts.push({ postId, timestamp: Date.now() });
        break;
      case 'comment':
        interests.commentedPosts.push({ postId, timestamp: Date.now() });
        break;
    }

    // Track category preferences
    if (postData.category) {
      interests.categories[postData.category] = 
        (interests.categories[postData.category] || 0) + this.getActionWeight(actionType);
    }

    // Track tag preferences
    if (postData.tags) {
      postData.tags.forEach(tag => {
        interests.tags[tag] = 
          (interests.tags[tag] || 0) + this.getActionWeight(actionType);
      });
    }

    interests.lastActive = Date.now();
  }

  getActionWeight(actionType) {
    const weights = {
      view: 1,
      like: 3,
      comment: 5
    };
    return weights[actionType] || 1;
  }

  // Get personalized recommendations
  getRecommendations(userId, allPosts, limit = 10) {
    const interests = this.userInterests.get(userId);
    
    if (!interests || interests.viewedPosts.length === 0) {
      // Return trending posts for new users
      return this.getTrendingPosts(allPosts, limit);
    }

    // Calculate scores for each post
    const scoredPosts = allPosts.map(post => {
      let score = 0;

      // Category match
      if (post.category && interests.categories[post.category]) {
        score += interests.categories[post.category] * 2;
      }

      // Tag matches
      if (post.tags) {
        post.tags.forEach(tag => {
          if (interests.tags[tag]) {
            score += interests.tags[tag] * 1.5;
          }
        });
      }

      // Recency boost
      const postAge = Date.now() - new Date(post.createdAt || post.timestamp).getTime();
      const daysSincePost = postAge / (1000 * 60 * 60 * 24);
      if (daysSincePost < 7) {
        score += (7 - daysSincePost) * 0.5;
      }

      // Popularity boost
      score += (post.likes || 0) * 0.2;
      score += (post.comments?.length || 0) * 0.3;
      score += (post.views || 0) * 0.01;

      // Content similarity to liked posts
      const similarityScore = this.calculateContentSimilarity(post, interests);
      score += similarityScore;

      // Penalize already viewed posts
      const hasViewed = interests.viewedPosts.some(
        v => v.postId === (post._id?.toString() || post.id)
      );
      if (hasViewed) {
        score *= 0.2;
      }

      return { ...post, recommendationScore: score };
    });

    // Sort by score and return top recommendations
    return scoredPosts
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  }

  calculateContentSimilarity(post, userInterests) {
    let similarityScore = 0;

    // Get user's most liked categories and tags
    const topCategories = Object.entries(userInterests.categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const topTags = Object.entries(userInterests.tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // Check if post matches user's top interests
    if (topCategories.includes(post.category)) {
      similarityScore += 3;
    }

    if (post.tags) {
      const matchingTags = post.tags.filter(tag => topTags.includes(tag));
      similarityScore += matchingTags.length * 2;
    }

    return similarityScore;
  }

  // Get trending posts
  getTrendingPosts(posts, limit = 10) {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    return posts
      .map(post => {
        const postTime = new Date(post.createdAt || post.timestamp).getTime();
        const isRecent = postTime > oneDayAgo;

        // Calculate trending score
        let trendingScore = 0;
        trendingScore += (post.likes || 0) * 2;
        trendingScore += (post.comments?.length || 0) * 3;
        trendingScore += (post.views || 0) * 0.1;
        
        // Boost recent posts
        if (isRecent) {
          trendingScore *= 1.5;
        }

        return { ...post, trendingScore };
      })
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);
  }

  // Get similar posts
  getSimilarPosts(currentPost, allPosts, limit = 5) {
    const scoredPosts = allPosts
      .filter(p => (p._id?.toString() || p.id) !== (currentPost._id?.toString() || currentPost.id))
      .map(post => {
        let similarity = 0;

        // Same category
        if (post.category === currentPost.category) {
          similarity += 5;
        }

        // Common tags
        if (post.tags && currentPost.tags) {
          const commonTags = post.tags.filter(tag => 
            currentPost.tags.includes(tag)
          );
          similarity += commonTags.length * 3;
        }

        // Same author
        if ((post.userId?.toString() || post.userId) === 
            (currentPost.userId?.toString() || currentPost.userId)) {
          similarity += 2;
        }

        // Similar engagement
        const engagementDiff = Math.abs(
          (post.likes || 0) - (currentPost.likes || 0)
        );
        if (engagementDiff < 10) {
          similarity += 1;
        }

        return { ...post, similarity };
      });

    return scoredPosts
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Get user interest profile
  getUserProfile(userId) {
    const interests = this.userInterests.get(userId);
    if (!interests) {
      return null;
    }

    return {
      totalInteractions: interests.viewedPosts.length + 
                        interests.likedPosts.length + 
                        interests.commentedPosts.length,
      topCategories: Object.entries(interests.categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, score]) => ({ category, score })),
      topTags: Object.entries(interests.tags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, score]) => ({ tag, score })),
      lastActive: interests.lastActive
    };
  }

  // Clear old user data
  cleanupOldData() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    for (const [userId, interests] of this.userInterests.entries()) {
      if (interests.lastActive < thirtyDaysAgo) {
        this.userInterests.delete(userId);
      }
    }
  }
}

module.exports = new RecommendationEngine();