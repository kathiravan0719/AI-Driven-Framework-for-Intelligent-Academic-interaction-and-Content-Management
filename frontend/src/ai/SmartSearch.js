class SmartSearch {
  // Advanced search with relevance scoring
  search(query, items, fields = ['title', 'content']) {
    if (!query || !query.trim()) return items;

    const queryTerms = query.toLowerCase().split(/\s+/);
    
    const scoredItems = items.map(item => {
      let score = 0;

      fields.forEach(field => {
        const fieldValue = this.getNestedValue(item, field);
        if (!fieldValue) return;

        const lowerField = fieldValue.toString().toLowerCase();

        // Exact match bonus
        if (lowerField === query.toLowerCase()) {
          score += 10;
        }

        // Phrase match bonus
        if (lowerField.includes(query.toLowerCase())) {
          score += 5;
        }

        // Individual term matches
        queryTerms.forEach(term => {
          if (lowerField.includes(term)) {
            score += 1;
            
            // Bonus for term at start
            if (lowerField.startsWith(term)) {
              score += 0.5;
            }
          }
        });

        // Tag exact match bonus
        if (field === 'tags' && Array.isArray(item.tags)) {
          item.tags.forEach(tag => {
            if (tag.toLowerCase() === query.toLowerCase()) {
              score += 8;
            }
          });
        }
      });

      return { ...item, searchScore: score };
    });

    // Filter and sort by score
    return scoredItems
      .filter(item => item.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore);
  }

  // Get nested object values
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => 
      current?.[prop], obj
    );
  }

  // Get search suggestions
  getSuggestions(query, items, limit = 5) {
    if (!query || query.length < 2) return [];

    const suggestions = new Set();

    items.forEach(item => {
      // From titles
      if (item.title?.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(item.title);
      }

      // From tags
      if (item.tags) {
        item.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(tag);
          }
        });
      }

      // From categories
      if (item.category?.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(item.category);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // Highlight search terms in text
  highlightMatches(text, query) {
    if (!query || !text) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  }
}

export default new SmartSearch();