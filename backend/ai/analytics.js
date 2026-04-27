class AnalyticsProcessor {
  // Calculate engagement rate
  calculateEngagementRate(post) {
    const totalInteractions = (post.likes || 0) + 
                             (post.comments?.length || 0) + 
                             (post.views || 0) * 0.1;
    
    const engagementRate = (totalInteractions / Math.max(post.views || 1, 1)) * 100;
    
    return {
      engagementRate: Math.min(100, engagementRate).toFixed(2),
      totalInteractions,
      breakdown: {
        likes: post.likes || 0,
        comments: post.comments?.length || 0,
        views: post.views || 0
      }
    };
  }

  // Analyze user activity patterns
  analyzeUserActivity(user, posts, comments) {
    const userPosts = posts.filter(p => 
      (p.userId?._id?.toString() || p.userId) === (user._id?.toString() || user.id)
    );

    const userComments = [];
    posts.forEach(post => {
      post.comments?.forEach(comment => {
        if ((comment.userId?._id?.toString() || comment.userId) === 
            (user._id?.toString() || user.id)) {
          userComments.push(comment);
        }
      });
    });

    const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const avgLikesPerPost = userPosts.length > 0 ? totalLikes / userPosts.length : 0;

    return {
      totalPosts: userPosts.length,
      totalComments: userComments.length,
      totalLikes,
      avgLikesPerPost: avgLikesPerPost.toFixed(1),
      activityScore: this.calculateActivityScore(userPosts, userComments),
      mostActiveCategory: this.getMostActiveCategory(userPosts),
      recentActivity: this.getRecentActivityTrend(userPosts, userComments)
    };
  }

  calculateActivityScore(posts, comments) {
    const postScore = posts.length * 5;
    const commentScore = comments.length * 2;
    const engagementScore = posts.reduce((sum, p) => 
      sum + (p.likes || 0) + (p.comments?.length || 0), 0
    );

    return Math.min(100, postScore + commentScore + engagementScore);
  }

  getMostActiveCategory(posts) {
    const categories = {};
    posts.forEach(post => {
      categories[post.category] = (categories[post.category] || 0) + 1;
    });

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  }

  getRecentActivityTrend(posts, comments) {
    const last7Days = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const recentPosts = posts.filter(p => 
      new Date(p.createdAt || p.timestamp).getTime() > last7Days
    );

    const recentComments = comments.filter(c => 
      new Date(c.timestamp || c.createdAt).getTime() > last7Days
    );

    return {
      posts: recentPosts.length,
      comments: recentComments.length,
      trend: recentPosts.length > posts.length * 0.3 ? 'increasing' : 'stable'
    };
  }

  // Generate platform statistics
  generatePlatformStats(posts, users) {
    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    const last7Days = now - (7 * 24 * 60 * 60 * 1000);
    const last30Days = now - (30 * 24 * 60 * 60 * 1000);

    // Post statistics
    const todayPosts = posts.filter(p => 
      new Date(p.createdAt || p.timestamp).getTime() >= today
    );

    const weekPosts = posts.filter(p => 
      new Date(p.createdAt || p.timestamp).getTime() >= last7Days
    );

    const monthPosts = posts.filter(p => 
      new Date(p.createdAt || p.timestamp).getTime() >= last30Days
    );

    // Category distribution
    const categoryDist = {};
    posts.forEach(post => {
      categoryDist[post.category] = (categoryDist[post.category] || 0) + 1;
    });

    // User activity
    const activeToday = users.filter(u => 
      u.lastActive && new Date(u.lastActive).getTime() >= today
    ).length;

    return {
      overview: {
        totalPosts: posts.length,
        totalUsers: users.length,
        totalComments: posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0),
        totalLikes: posts.reduce((sum, p) => sum + (p.likes || 0), 0)
      },
      activity: {
        today: {
          posts: todayPosts.length,
          activeUsers: activeToday
        },
        week: {
          posts: weekPosts.length
        },
        month: {
          posts: monthPosts.length
        }
      },
      categoryDistribution: Object.entries(categoryDist).map(([name, value]) => ({
        name,
        value
      })),
      engagementRate: this.calculateOverallEngagement(posts),
      growthRate: this.calculateGrowthRate(posts)
    };
  }

  calculateOverallEngagement(posts) {
    if (posts.length === 0) return 0;

    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalInteractions = posts.reduce((sum, p) => 
      sum + (p.likes || 0) + (p.comments?.length || 0), 0
    );

    return ((totalInteractions / Math.max(totalViews, 1)) * 100).toFixed(2);
  }

  calculateGrowthRate(posts) {
    const now = Date.now();
    const lastWeek = now - (7 * 24 * 60 * 60 * 1000);
    const weekBefore = lastWeek - (7 * 24 * 60 * 60 * 1000);

    const lastWeekPosts = posts.filter(p => {
      const time = new Date(p.createdAt || p.timestamp).getTime();
      return time >= lastWeek && time < now;
    }).length;

    const weekBeforePosts = posts.filter(p => {
      const time = new Date(p.createdAt || p.timestamp).getTime();
      return time >= weekBefore && time < lastWeek;
    }).length;

    if (weekBeforePosts === 0) return 100;

    const growth = ((lastWeekPosts - weekBeforePosts) / weekBeforePosts) * 100;
    return growth.toFixed(1);
  }

  // Generate activity timeline
  generateActivityTimeline(posts, days = 7) {
    const timeline = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayPosts = posts.filter(p => {
        const postTime = new Date(p.createdAt || p.timestamp);
        return postTime >= date && postTime < nextDay;
      });

      timeline.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        posts: dayPosts.length,
        comments: dayPosts.reduce((sum, p) => sum + (p.comments?.length || 0), 0),
        likes: dayPosts.reduce((sum, p) => sum + (p.likes || 0), 0)
      });
    }

    return timeline;
  }
}

module.exports = new AnalyticsProcessor();