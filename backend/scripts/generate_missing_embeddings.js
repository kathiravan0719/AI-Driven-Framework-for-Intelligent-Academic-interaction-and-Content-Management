const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const aiService = require('../utils/aiService');
const Content = require('../models/Content');
const Event = require('../models/Event');
const Post = require('../models/Post');

/**
 * Identify and fix records missing AI embeddings for the RAG pipeline.
 * This script is safe to re-run as it only targets records without embeddings.
 */
async function generateMissingEmbeddings() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found in .env');

    await mongoose.connect(mongoUri);
    console.log('🚀 DB Connected for Embedding Recovery');

    const collections = [
      { model: Content, name: 'Content Hub', textField: 'extractedText', fallbackField: 'description' },
      { model: Event, name: 'Campus Events', textField: 'description', fallbackField: 'title' },
      { model: Post, name: 'Community Feed', textField: 'content', fallbackField: 'title' }
    ];

    for (const col of collections) {
      console.log(`\n🔍 Scanning ${col.name}...`);
      
      // Find docs where embedding is missing, empty, or wrong dimension (if we wanted to re-embed everything, but let's stick to missing for now)
      const docs = await col.model.find({ 
        $or: [
          { embedding: { $exists: false } }, 
          { embedding: { $size: 0 } }
        ] 
      });

      if (docs.length === 0) {
        console.log(`✅ All ${col.name} records are already vectorized.`);
        continue;
      }

      console.log(`📍 Found ${docs.length} items requiring vectorization.`);

      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        const textToEmbed = doc[col.textField] || doc[col.fallbackField] || doc.title || '';
        
        if (textToEmbed.trim().length > 5) {
          process.stdout.write(`   [${i+1}/${docs.length}] Vectorizing: "${(doc.title || doc._id).toString().substring(0, 30)}"... `);
          
          try {
            const embedding = await aiService.getEmbedding(textToEmbed);
            
            // Basic validation of embedding (check if it's not the mock zero array)
            const isMock = embedding.every(v => v === 0);
            
            if (embedding && embedding.length > 0 && !isMock) {
              doc.embedding = embedding;
              await doc.save();
              console.log('✅ Synchronized (3072-D)');
            } else {
              console.log('⚠️ Failed (API returned empty or mock result)');
            }
          } catch (e) {
            console.log(`❌ Error: ${e.message}`);
          }

          // Respect Gemini Free Tier RPM limits
          await new Promise(r => setTimeout(r, 1000)); 
        } else {
          console.log(`   [${i+1}/${docs.length}] Skipping (Insufficient text)`);
        }
      }
    }

    console.log('\n✨ AI Knowledge Base Synchronization Complete!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Fatal recovery error:', err);
    process.exit(1);
  }
}

generateMissingEmbeddings();
