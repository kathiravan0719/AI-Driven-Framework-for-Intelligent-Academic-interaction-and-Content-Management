const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
        type: String,
        enum: ['General', 'Academic', 'Cultural', 'Technical', 'Sports', 'Workshop', 'Placement'],
        default: 'General'
    },
    date: { type: Date, required: true },
    time: { type: String, default: '10:00 AM' },
    location: { type: String, default: 'Campus' },
    image: { type: String, default: '🎯' }, // emoji or URL
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organizerName: { type: String, default: 'Admin' },
    maxAttendees: { type: Number, default: 200 },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['upcoming', 'past', 'cancelled'], default: 'upcoming' },
    isApproved: { type: Boolean, default: true },
    tags: [{ type: String }],
    embedding: { type: [Number], default: [] },
}, { timestamps: true });

// Virtual: attendee count
EventSchema.virtual('attendeeCount').get(function () {
    return this.attendees.length;
});

EventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', EventSchema);
