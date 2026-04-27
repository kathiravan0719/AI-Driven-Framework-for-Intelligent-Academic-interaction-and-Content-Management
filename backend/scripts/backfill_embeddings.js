const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const aiService = require('../utils/aiService');
const Content = require('../models/Content');
const Event = require('../models/Event');
const Post = require('../models/Post');

async function backfill() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-college-system';
    await mongoose.connect(mongoUri);
    console.log('🚀 DB Connected for Embedding Backfill');

    const collections = [
      { model: Content, name: 'Content', textField: 'extractedText', fallbackField: 'description' },
      { model: Event, name: 'Event', textField: 'description', fallbackField: 'title' },
      { model: Post, name: 'Post', textField: 'content', fallbackField: 'title' }
    ];

    for (const col of collections) {
      console.log(`\n🔍 Checking ${col.name} collection...`);
      const docs = await col.model.find({ 
        $or: [
          { embedding: { $exists: false } }, 
          { embedding: { $size: 0 } }
        ] 
      });

      console.log(`📍 Found ${docs.length} items to update in ${col.name}`);

      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        const textToEmbed = doc[col.textField] || doc[col.fallbackField] || doc.title || '';
        
        if (textToEmbed.trim().length > 10) {
          process.stdout.write(`   [${i+1}/${docs.length}] Embedding "${(doc.title || doc._id).toString().substring(0, 30)}"... `);
          const embedding = await aiService.getEmbedding(textToEmbed);
          
          if (embedding && embedding.length > 0 && embedding[0] !== 0) {
            doc.embedding = embedding;
            await doc.save();
            console.log('✅ Success');
          } else {
            console.log('❌ Failed (Mock or Error)');
          }

          // Small delay to respect Gemini rate limits
          await new Promise(r => setTimeout(r, 200));
        } else {
          console.log(`   [${i+1}/${docs.length}] Skipping (Text too short)`);
        }
      }
    }

    console.log('\n✨ Backfill Complete!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Fatal backfill error:', err);
    process.exit(1);
  }
}

backfill();
