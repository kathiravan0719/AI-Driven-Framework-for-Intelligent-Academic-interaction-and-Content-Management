const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI is missing in environment variables!');
    }
    
    // Sanitize URI: Remove empty appName or other trailing parameters that cause crashes
    if (uri.includes('?appName')) {
      uri = uri.split('?appName')[0];
    }
    
    await mongoose.connect(uri);
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
