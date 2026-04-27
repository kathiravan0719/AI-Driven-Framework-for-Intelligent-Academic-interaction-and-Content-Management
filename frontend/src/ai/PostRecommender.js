class PostRecommender {
  constructor() {
    this.userInterests = new Map();
  }

  // Track user interactions
  trackInteraction(userId, postId, postData, interactionType) {
    if (!this.userInterests.has(userId)) {
      this.userInterests.set(userId, {
        categories: {},
        tags: {},
        interactions: []
      });
    }

    const interests = this.userInterests.get(userId);

    // Track category interest
    if (postData.category) {
      interests.categories[postData.category] = 
        (interests.categories[postData.category] || 0) + 1;
    }

    // Track tag interests
    if (postData.tags) {
      postData.tags.forEach(tag => {
        interests.tags[tag] = (interests.tags[tag] || 0) + 1;
      });
    }

    // Track interaction
    interests.interactions.push({
      postId,
      type: interactionType, // 'view', 'like', 'comment'
      timestamp: Date.now()
    });
  }

  // Get recommended posts for user
  getRecommendations(userId, allPosts, limit = 5) {
    const interests = this.userInterests.get(userId);
    if (!interests) {
      // Return trending posts for new users
      return allPosts
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, limit);
    }

    // Calculate recommendation scores
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
            score += interests.tags[tag];
          }
        });
      }

      // Boost recent posts
      const daysSincePost = (Date.now() - new Date(post.timestamp || post.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysSincePost < 7) {
        score += (7 - daysSincePost) * 0.5;
      }

      // Boost popular posts
      score += (post.likes || 0) * 0.1;
      score += (post.comments?.length || 0) * 0.2;

      // Penalize already viewed posts
      const hasViewed = interests.interactions.some(
        i => i.postId === (post._id || post.id)
      );
      if (hasViewed) score *= 0.3;

      return { ...post, recommendationScore: score };
    });

    // Sort by score and return top recommendations
    return scoredPosts
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  }

  // Get similar posts
  getSimilarPosts(currentPost, allPosts, limit = 3) {
    const scoredPosts = allPosts
      .filter(p => (p._id || p.id) !== (currentPost._id || currentPost.id))
      .map(post => {
        let similarity = 0;

        // Same category
        if (post.category === currentPost.category) {
          similarity += 3;
        }

        // Common tags
        if (post.tags && currentPost.tags) {
          const commonTags = post.tags.filter(tag => 
            currentPost.tags.includes(tag)
          );
          similarity += commonTags.length * 2;
        }

        // Same author
        if (post.userId === currentPost.userId) {
          similarity += 1;
        }

        return { ...post, similarity };
      });

    return scoredPosts
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}

export default new PostRecommender();