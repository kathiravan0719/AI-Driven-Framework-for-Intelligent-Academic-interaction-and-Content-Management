/**
 * Database Cleanup Script — Prepare for Production
 * Wipes all demo/seed data and clears the uploads directory.
 * Run: node scripts/cleanup-demo-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const Content = require('../models/Content');
const Event = require('../models/Event');
const Post = require('../models/Post');
const AIConversation = require('../models/AIConversation');
const AIMessage = require('../models/AIMessage');
const AuditLog = require('../models/AuditLog');

const uploadsDir = path.join(__dirname, '../uploads');

async function cleanup() {
  try {
    console.log('🚀 Starting Database & Filesystem Cleanup...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Wipe Collections
    console.log('🗑️  Wiping collections...');
    const results = await Promise.all([
      Content.deleteMany({}),
      Event.deleteMany({}),
      Post.deleteMany({}),
      AIConversation.deleteMany({}),
      AIMessage.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log(`   - Deleted ${results[0].deletedCount} Content records`);
    console.log(`   - Deleted ${results[1].deletedCount} Events`);
    console.log(`   - Deleted ${results[2].deletedCount} Posts`);
    console.log(`   - Deleted ${results[3].deletedCount} AI Conversations`);
    console.log(`   - Deleted ${results[4].deletedCount} AI Messages`);
    console.log(`   - Deleted ${results[5].deletedCount} Audit Logs`);

    // 2. Clear Uploads folder
    console.log('📂 Clearing uploads directory...');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let count = 0;
      for (const file of files) {
        if (file === '.gitkeep') continue;
        fs.unlinkSync(path.join(uploadsDir, file));
        count++;
      }
      console.log(`✅ Removed ${count} files from disk.`);
    }

    console.log('\n✨ System cleaned successfully! Ready for real data onboarding.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();
