const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Notes', 'Assignment', 'Circular', 'Resource', 'Syllabus'], default: 'Notes' },
    category: {
        type: String,
        enum: ['General', 'Academic', 'Technical', 'Administrative', 'Library'],
        default: 'Academic'
    },
    subject: { type: String, required: true },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    filename: { type: String, required: true },    // stored filename on disk
    originalName: { type: String, required: true }, // original upload name
    mimetype: { type: String },
    size: { type: Number },                         // bytes
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploaderName: { type: String },
    downloadCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
    
    // AI RAG Fields
    extractedText: { type: String, default: '' },
    summary: { type: String, default: '' },
    embedding: { type: [Number], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);
