const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const officeParser = require('officeparser');
const Content = require('../models/Content');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const aiService = require('../utils/aiService');
const asyncHandler = require('../middleware/asyncHandler');
const { createNotification } = require('../utils/notificationHelper');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer disk storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|doc|docx|ppt|pptx|txt|xls|xlsx|jpg|jpeg|png|zip/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        if (ext) cb(null, true);
        else cb(new Error('File type not allowed'));
    }
});

// GET all content (with filters)
router.get('/', asyncHandler(async (req, res, next) => {
    const { type, subject, category, search } = req.query;
    let query = {};
    if (type && type !== 'All') query.type = type;
    if (subject && subject !== 'All') query.subject = subject;
    if (category && category !== 'All') query.category = category;
    if (search) query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
    ];
    
    // Only return approved content by default. Admins can fetch all.
    if (req.query.all !== 'true') {
        query.isApproved = true;
    }

    const contents = await Content.find(query).sort({ createdAt: -1 });
    res.json(contents);
}));

/**
 * Extract text from any supported file type.
 * Supports: PDF, PPTX, PPT, DOCX, DOC, TXT
 */
const extractTextFromFile = async (filePath, mimetype, originalName) => {
    const ext = path.extname(originalName).toLowerCase();

    // ── PDF ──────────────────────────────────────────────────────────────────
    if (mimetype === 'application/pdf' || ext === '.pdf') {
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const parser = new PDFParse({ data: dataBuffer });
            const result = await parser.getText();
            return result.text || '';
        } catch (err) {
            console.error('PDF parse error:', err.message);
            return '';
        }
    }

    // ── PowerPoint (PPTX / PPT) ───────────────────────────────────────────────
    if (['.pptx', '.ppt'].includes(ext) || mimetype.includes('presentation') || mimetype.includes('powerpoint')) {
        try {
            const text = await new Promise((resolve, reject) => {
                officeParser.parseOffice(filePath, (data, err) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
            return text || '';
        } catch (err) {
            console.error('PPT parse error:', err.message);
            return '';
        }
    }

    // ── Word Documents (DOCX / DOC) ───────────────────────────────────────────
    if (['.docx', '.doc'].includes(ext) || mimetype.includes('wordprocessingml') || mimetype.includes('msword')) {
        try {
            const text = await new Promise((resolve, reject) => {
                officeParser.parseOffice(filePath, (data, err) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
            return text || '';
        } catch (err) {
            console.error('DOCX parse error:', err.message);
            return '';
        }
    }

    // ── Plain Text ────────────────────────────────────────────────────────────
    if (ext === '.txt' || mimetype === 'text/plain') {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (err) {
            console.error('TXT read error:', err.message);
            return '';
        }
    }

    return ''; // Unsupported format
};

// POST upload content (faculty/admin only)
router.post('/', auth, upload.single('file'), asyncHandler(async (req, res, next) => {
    const { title, type, subject, category, description, tags } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let extractedText = '';
    let summary = '';
    let embedding = [];

    // Extract text from the uploaded file (PDF, PPTX, DOCX, TXT, etc.)
    try {
        const filePath = path.join(uploadsDir, req.file.filename);
        console.log(`🧠 Extracting text from: ${req.file.originalname} (${req.file.mimetype})`);
        extractedText = await extractTextFromFile(filePath, req.file.mimetype, req.file.originalname);

        if (extractedText && extractedText.trim().length > 50) {
            console.log(`✅ Extracted ${extractedText.length} characters — generating AI summary & embedding...`);
            summary = await aiService.generateSummary(extractedText);
            embedding = await aiService.getEmbedding(extractedText);
            console.log(`✅ AI processing complete for: ${req.file.originalname}`);
        } else {
            console.log(`⚠️  No extractable text found in: ${req.file.originalname} — using title/description fallback`);
        }
    } catch (err) {
        console.error('Text extraction pipeline failed:', err.message);
    }

    // Fallback: if no embedding yet, embed title + description so file is still searchable
    if ((!embedding || embedding.length === 0) && aiService) {
        const fallbackText = `${title} ${description || ''}`;
        if (fallbackText.trim().length > 10) {
            embedding = await aiService.getEmbedding(fallbackText);
        }
    }

    const content = new Content({
        title,
        type: type || 'Notes',
        category: category || 'Academic',
        subject: subject || 'General',
        description: description || '',
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user.userId,
        uploaderName: req.body.uploaderName || 'Faculty',
        extractedText,
        summary,
        embedding
    });

    await content.save();
    res.status(201).json({ success: true, content });
}));

// GET download a file
router.get('/download/:id', asyncHandler(async (req, res, next) => {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ error: 'File not found' });

    const filePath = path.join(uploadsDir, content.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on server' });

    // Increment download count
    content.downloadCount += 1;
    await content.save();

    res.download(filePath, content.originalName);
}));

// GET preview/view a file inline
router.get('/view/:id', asyncHandler(async (req, res, next) => {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ error: 'File not found' });

    const filePath = path.join(uploadsDir, content.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on server' });

    // Increment view count
    content.views = (content.views || 0) + 1;
    await content.save();

    // Serve file inline
    res.setHeader('Content-Type', content.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${content.originalName}"`);
    
    // Remove framing restrictions to allow the frontend application to preview the PDF inside an iframe
    res.removeHeader('X-Frame-Options');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    res.sendFile(filePath);
}));

// PATCH approve content (admin only)
router.patch('/:id/approve', auth, asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const content = await Content.findByIdAndUpdate(
        req.params.id,
        { isApproved: true },
        { new: true }
    );
    if (!content) return res.status(404).json({ error: 'Not found' });

    await AuditLog.create({
        adminId: user._id,
        adminName: user.name,
        adminEmail: user.email,
        actionType: 'APPROVE_CONTENT',
        severity: 'low',
        targetType: 'CONTENT',
        targetId: content._id,
        metadata: { targetTitle: content.title, targetUploader: content.uploaderName }
    });

    // Trigger Notification for the uploader
    await createNotification(req.app, {
        recipient: content.uploadedBy,
        sender: user._id,
        type: 'academic_update',
        title: 'Content Authorized',
        message: `Your resource "${content.title}" has been authorized for campus synchronization.`,
        link: '/content'
    });

    res.json({ success: true, content });
}));

// DELETE content (admin or uploader)
router.delete('/:id', auth, asyncHandler(async (req, res, next) => {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ error: 'Not found' });

    const user = await User.findById(req.user.userId);
    const isAdmin = user && user.role === 'admin';
    const isUploader = content.uploadedBy && content.uploadedBy.toString() === req.user.userId;

    if (!isAdmin && !isUploader) {
        return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from disk
    const filePath = path.join(uploadsDir, content.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Content.findByIdAndDelete(req.params.id);

    if (isAdmin) {
         await AuditLog.create({
            adminId: user._id,
            adminName: user.name,
            adminEmail: user.email,
            actionType: 'DELETE_CONTENT',
            severity: 'medium',
            targetType: 'CONTENT',
            targetId: content._id,
            metadata: { targetTitle: content.title, targetUploader: content.uploaderName, deletedByAdminFile: true }
         });
    }

    res.json({ success: true });
}));

module.exports = router;
