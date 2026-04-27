require('dotenv').config();
const mongoose = require('mongoose');
const aiService = require('../utils/aiService');
const Content = require('../models/Content');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Test 1: Academic RAG
    console.log('🔍 Testing Academic RAG...');
    const doc = await Content.findOne({ title: /Algorithms/i });
    if (!doc) throw new Error('Algorithms doc not found');
    
    const academicRes = await aiService.queryWithContext(
      "What are the learning objectives for CS-301?", 
      doc.extractedText
    );
    console.log('\n--- ACADEMIC RESPONSE ---');
    console.log(academicRes);
    
    // Test 2: Platform Knowledge
    console.log('\n🔍 Testing Platform Knowledge...');
    const platformRes = await aiService.queryWithContext(
      "Where can I find the campus events?", 
      "No relevant documents found."
    );
    console.log('\n--- PLATFORM RESPONSE ---');
    console.log(platformRes);
    
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

verify();
