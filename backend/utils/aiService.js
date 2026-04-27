const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini SDK with modern unified client
let ai = null;
const embeddingCache = new Map(); // Simple in-memory cache for production hardening
const MAX_CACHE_SIZE = 500;

try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("🤖 Gemini AI Service Initialized (v2.5 Flash-Lite & Embedding-2 Enabled)!");
  } else {
    console.warn("⚠️ GEMINI_API_KEY not found in .env! AI Features will run in Mock Mode.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini:", error);
}

/**
 * Helper: Cosine Similarity for Vector Search
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  
  // Handle potential length mismatches (pad with zeros or truncate)
  const len = Math.max(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < len; i++) {
    const a = vecA[i] || 0;
    const b = vecB[i] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

class AIService {

  /**
   * Generates a succinct summary for an uploaded PDF/document.
   */
  async generateSummary(text) {
    if (!ai) return "AI Summary unavailable (Mock Mode). This is a placeholder summary for the document.";

    try {
      const truncatedText = text.substring(0, 30000); // Increased context window for summary
      const prompt = `You are an academic assistant. Please summarize the following academic document in 2-3 concise sentences. Focus closely on the core concepts taught within.\n\nDocument text:\n${truncatedText}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{ parts: [{ text: prompt }] }]
      });

      return response.text;
    } catch (error) {
      console.error("❌ Summarization error:", error.message);
      if (error.error) console.error("Details:", JSON.stringify(error.error));
      return "Unable to generate summary due to an error.";
    }
  }

  /**
   * Generates a 3072-D vector embedding for semantic search.
   */
  async getEmbedding(text) {
    if (!ai) return new Array(3072).fill(0);

    const truncatedText = text.trim().substring(0, 10000);
    if (!truncatedText) return new Array(3072).fill(0);

    // Cache lookup
    if (embeddingCache.has(truncatedText)) {
      return embeddingCache.get(truncatedText);
    }

    try {
      const result = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: [{ parts: [{ text: truncatedText }] }]
      });

      // SDK returns embeddings array
      let values = [];
      if (result.embeddings && result.embeddings.length > 0) {
        values = result.embeddings[0].values;
      } else if (result.embedding) {
        values = result.embedding.values;
      }
      
      if (values.length > 0) {
        // Cache management (simple LRU-ish: clear if full)
        if (embeddingCache.size >= MAX_CACHE_SIZE) {
          const firstKey = embeddingCache.keys().next().value;
          embeddingCache.delete(firstKey);
        }
        embeddingCache.set(truncatedText, values);
        return values;
      }
      
      throw new Error("No embedding values returned from API");
    } catch (error) {
      console.error("❌ Embedding generation error:", error.message);
      return new Array(3072).fill(0); // Return empty vector to prevent crash
    }
  }

  /**
   * RAG Query: Ask a question and provide the context retrieved from Vector Search.
   */
  async queryWithContext(question, contextText) {
    if (!ai) {
      return `[Mock Mode] I am currently in offline test mode. \n\nI see you asked: "${question}". \nIf I was online, I would use this context to answer you: ${contextText.substring(0, 200)}...`;
    }

    try {
      // Fine-tuned system prompt for clarity and structure
      const systemPrompt = `You are the "Neural Assistant," an advanced AI for the "AI College CMS" (Intelligent Campus Learning Hub).

### PLATFORM KNOWLEDGE BASE (SYSTEM GUIDELINES):
1. **Community Feed**: Connect with students. Create posts at the top of the "Feed" page. Like/Comment to engage.
2. **Content Hub**: Academic repository. Browse Notes, Assignments, and Syllabi. Upload via "Upload Content" button.
3. **Campus Events**: Workshops, seminars, sports. Found in "Content Hub" -> "Events". Register online.
4. **AI Capabilities**: RAG Pipeline for context-aware answers, Automated Summarization, Semantic Search.
5. **Dashboard**: Track personal progress and campus activity.

### MISSION:
Provide a highly structured, professional response. If the student asks to "summarize," you MUST provide a deep, bulleted analysis of the [Source Context] below. 

### CRITICAL INSTRUCTIONS:
- **Document Focus**: If a [FOCUS DOCUMENT] is present, prioritize its content above all else. Analyze it deeply.
- **Summarization**: Use bold headers, bullet points, and a "Key Takeaway" section for all summaries.
- **Source Attribution**: Always mention which source you are using (e.g., "Based on the document...").
- **Clarity & Structure**: Use **Markdown**, bold terms, and lists for readability.
- **No Hallucinations**: If the context doesn't contain the answer, say: "I couldn't find specific info in the document, but..."
- **Professionalism**: Do not use internal labels like "User" or "System".

[Source Context]:
${contextText || "No specific campus records match this query."}

[Student Question]:
${question}

[Neural Assistant Response]:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.2, // Lower temperature for more consistent, factual responses
        }
      });

      if (!response || !response.text) {
        throw new Error("Empty response from AI model");
      }

      return response.text;
    } catch (error) {
      console.error("❌ RAG Query Critical Failure:", error.message);
      
      // User-friendly fallback error messages
      const fallbackMessages = [
        "I apologize, but I encountered an error while processing your request. This may be due to a temporary connection blip with my neural core. Please try again in a moment.",
        "My knowledge network is currently experiencing high latency. I'm unable to retrieve that specific information right now.",
        "I'm having trouble synthesizing the campus data at the moment. Please try rephrasing your question."
      ];
      
      return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    }
  }

  /**
   * Vector Search against any Model (Content, Event, Post, User, etc.)
   */
  async searchSimilarDocuments(queryEmbedding, Model, limit = 5) {
    try {
      // Performance optimization: Filter documents with embeddings first
      // In production, this would use an Atlas Vector Search index ($vectorSearch)
      const query = { embedding: { $exists: true, $not: { $size: 0 } } };
      
      // Safety checks for approved content
      if (Model.schema.paths.isApproved) query.isApproved = true;
      if (Model.schema.paths.status) query.status = { $ne: 'Cancelled' };

      const allDocs = await Model.find(query).lean();
      if (!allDocs || allDocs.length === 0) {
        console.log(`ℹ️ No searchable records found in ${Model.modelName}`);
        return [];
      }

      // Calculate similarity and rank
      const scoredDocs = allDocs.map(doc => {
        const score = cosineSimilarity(queryEmbedding, doc.embedding);
        return { ...doc, similarityScore: score, collectionName: Model.modelName };
      });

      // Filter and sort
      // Higher threshold (0.5) for production hardening to ensure high relevance
      const relevantDocs = scoredDocs
        .filter(d => d.similarityScore > 0.5)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);

      return relevantDocs;
    } catch (error) {
      console.error(`❌ Search error for ${Model.modelName}:`, error.message);
      return [];
    }
  }
}

module.exports = new AIService();


