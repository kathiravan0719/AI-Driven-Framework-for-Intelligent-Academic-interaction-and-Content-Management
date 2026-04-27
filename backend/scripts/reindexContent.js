/**
 * One-time re-indexing script:
 * Re-processes all existing content files to extract text, 
 * generate AI summaries, and create embeddings.
 * 
 * Run with: node scripts/reindexContent.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

let officeParser;
try {
  officeParser = require('officeparser');
} catch(e) {
  console.warn('officeparser not installed — PPT/DOCX extraction unavailable');
}

const Content = require('../models/Content');
const aiService = require('../utils/aiService');

const uploadsDir = path.join(__dirname, '../uploads');

const extractTextFromFile = async (filePath, mimetype, originalName) => {
  const ext = path.extname(originalName).toLowerCase();

  if (mimetype === 'application/pdf' || ext === '.pdf') {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      return result.text || '';
    } catch (err) {
      console.error(`  PDF parse error: ${err.message}`);
      return '';
    }
  }

  if (['.pptx', '.ppt'].includes(ext) || mimetype.includes('presentation') || mimetype.includes('powerpoint')) {
    if (!officeParser) return '';
    try {
      return await new Promise((resolve, reject) => {
        officeParser.parseOffice(filePath, (data, err) => {
          if (err) reject(err);
          else resolve(data || '');
        });
      });
    } catch (err) {
      console.error(`  PPT parse error: ${err.message}`);
      return '';
    }
  }

  if (['.docx', '.doc'].includes(ext) || mimetype.includes('wordprocessingml') || mimetype.includes('msword')) {
    if (!officeParser) return '';
    try {
      return await new Promise((resolve, reject) => {
        officeParser.parseOffice(filePath, (data, err) => {
          if (err) reject(err);
          else resolve(data || '');
        });
      });
    } catch (err) {
      console.error(`  DOCX parse error: ${err.message}`);
      return '';
    }
  }

  if (ext === '.txt' || mimetype === 'text/plain') {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      console.error(`  TXT read error: ${err.message}`);
      return '';
    }
  }

  return '';
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const allContent = await Content.find({});
    console.log(`\n📂 Found ${allContent.length} content files to process\n`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const doc of allContent) {
      process.stdout.write(`  Processing: ${doc.originalName || doc.title} ... `);

      // Skip files that already have extractedText
      if (doc.extractedText && doc.extractedText.trim().length > 50) {
        console.log('SKIPPED (already indexed)');
        skipped++;
        continue;
      }

      // Check if file exists on disk
      const filePath = path.join(uploadsDir, doc.filename);
      if (!fs.existsSync(filePath)) {
        console.log('SKIPPED (file missing on disk)');
        skipped++;
        continue;
      }

      try {
        // Extract text
        const extractedText = await extractTextFromFile(filePath, doc.mimetype, doc.originalName || doc.title);

        if (extractedText && extractedText.trim().length > 50) {
          // Generate summary and embedding
          const summary = await aiService.generateSummary(extractedText);
          const embedding = await aiService.getEmbedding(extractedText);

          await Content.findByIdAndUpdate(doc._id, {
            extractedText,
            summary,
            embedding
          });

          console.log(`✅ DONE (${extractedText.length} chars extracted)`);
          updated++;
        } else {
          // No extractable text — still update embedding from title+description
          const fallbackText = `${doc.title} ${doc.description || ''}`;
          if (fallbackText.trim().length > 10 && (!doc.embedding || doc.embedding.length === 0)) {
            const embedding = await aiService.getEmbedding(fallbackText);
            await Content.findByIdAndUpdate(doc._id, { embedding });
            console.log('⚠️  DONE (no text extracted — fallback embedding from title/description)');
          } else {
            console.log('⚠️  SKIPPED (no extractable text, fallback embedding already exists)');
          }
          skipped++;
        }
      } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
        failed++;
      }
    }

    console.log('\n═══════════════════════════════════════════');
    console.log(`  ✅ Updated: ${updated}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Failed:  ${failed}`);
    console.log('═══════════════════════════════════════════\n');

  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected. Done.');
    process.exit(0);
  }
};

run();
