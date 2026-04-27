const mongoose = require('mongoose');

async function checkEmbeddings() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ai-college-system');
        const Content = mongoose.model('Content', new mongoose.Schema({}, { strict: false }));
        const total = await Content.countDocuments();
        const withEmbeddings = await Content.countDocuments({ embedding: { $exists: true, $not: { $size: 0 } } });
        console.log('Total Content:', total);
        console.log('With Embeddings:', withEmbeddings);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkEmbeddings();
