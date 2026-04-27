const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const aiService = require('../utils/aiService');
const asyncHandler = require('../middleware/asyncHandler');

// ─── GET all events (with filters) ───────────────────────────────────────────
router.get('/', asyncHandler(async (req, res, next) => {
    const { category, status, search } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
}));

// ─── GET single event ─────────────────────────────────────────────────────────
router.get('/:id', asyncHandler(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
}));

// ─── POST create event (faculty/admin only) ───────────────────────────────────
router.post('/', auth, asyncHandler(async (req, res, next) => {
    const { title, description, category, date, time, location, image, maxAttendees, tags } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });

    const event = new Event({
        title,
        description: description || '',
        category: category || 'General',
        date: new Date(date),
        time: time || '10:00 AM',
        location: location || 'Campus',
        image: image || '🎯',
        organizer: req.user.userId,
        organizerName: req.body.organizerName || 'Faculty',
        maxAttendees: maxAttendees || 200,
        tags: tags || [],
    });

    // Generate embedding for search
    const textToEmbed = `${title} ${description || ''}`;
    event.embedding = await aiService.getEmbedding(textToEmbed);

    await event.save();
    res.status(201).json({ success: true, event });
}));

// ─── PUT update event ─────────────────────────────────────────────────────────
router.put('/:id', auth, asyncHandler(async (req, res, next) => {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ success: true, event });
}));

// ─── DELETE event ─────────────────────────────────────────────────────────────
router.delete('/:id', auth, asyncHandler(async (req, res, next) => {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ success: true });
}));

// ─── POST register for event ──────────────────────────────────────────────────
router.post('/:id/register', auth, asyncHandler(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const userId = req.user.userId;
    if (event.attendees.includes(userId)) {
        return res.status(400).json({ error: 'Already registered' });
    }
    if (event.attendees.length >= event.maxAttendees) {
        return res.status(400).json({ error: 'Event is full' });
    }

    event.attendees.push(userId);
    await event.save();
    res.json({ success: true, attendeeCount: event.attendees.length });
}));

// ─── POST unregister from event ───────────────────────────────────────────────
router.post('/:id/unregister', auth, asyncHandler(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    event.attendees = event.attendees.filter(id => id.toString() !== req.user.userId);
    await event.save();
    res.json({ success: true, attendeeCount: event.attendees.length });
}));

module.exports = router;