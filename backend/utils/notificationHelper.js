const Notification = require('../models/Notification');

/**
 * Centralized utility to create a notification and emit it via Socket.io
 * 
 * @param {Object} app - Express app instance (to get 'io')
 * @param {Object} data - { recipient, sender, type, title, message, link }
 */
const createNotification = async (app, data) => {
    try {
        const { recipient, sender, type, title, message, link } = data;
        
        // Don't notify if user is performing action on their own stuff
        if (recipient.toString() === sender?.toString()) return null;

        const notif = new Notification({
            recipient,
            sender,
            type,
            title,
            message,
            link,
            isRead: false
        });

        await notif.save();

        const io = app.get('io');
        if (io) {
            // Send to specific recipient room if it exists (assuming rooms are named by userId)
            io.to(recipient.toString()).emit('new-notification', notif);
            
            // Also emit globally for certain types if needed, but usually targeted is better
            // io.emit('broadcast-notification', notif); 
        }

        return notif;
    } catch (err) {
        console.error('Notification Error:', err);
        return null;
    }
};

module.exports = { createNotification };
