const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminName: {
        type: String,
        required: true
    },
    adminEmail: {
        type: String,
        required: true
    },
    actionType: {
        type: String,
        required: true,
        enum: ['DELETE_USER', 'UPDATE_ROLE', 'APPROVE_CONTENT', 'DELETE_CONTENT']
    },
    severity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high']
    },
    targetType: {
        type: String,
        required: true,
        enum: ['USER', 'CONTENT']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    metadata: {
        type: Object,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now,
        // Establish 90 days TTL (Time-To-Live). Documents will automatically be deleted by MongoDB after this period.
        expires: '90d'
    }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
