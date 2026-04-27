require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const postsRoutes = require('./routes/posts');
const eventsRoutes = require('./routes/events');
const contentRoutes = require('./routes/content');
const chatRoutes = require('./routes/chat');
const aiRoutes = require('./routes/ai');
const notificationsRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const server = http.createServer(app);

// Track online users: { odId: socketId }
const onlineUsers = {};

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// CORS middleware — allow frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Security and Performance Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development, should be configured for production
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parser middleware
app.use(express.json());

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Error Handler Middleware (MUST be after all routes)
app.use(errorHandler);

// Test route
app.get('/', (req, res) => {
  res.send('Server running');
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // User comes online
  socket.on('user-online', (userId) => {
    if (userId) {
      onlineUsers[userId] = socket.id;
      socket.userId = userId;
      socket.join(`user-${userId}`);
      // Broadcast online status to all clients
      io.emit('online-users', Object.keys(onlineUsers));
      console.log(`✅ User ${userId} is online`);
    }
  });

  // Post rooms
  socket.on('join-post', (postId) => {
    socket.join(`post-${postId}`);
  });

  socket.on('leave-post', (postId) => {
    socket.leave(`post-${postId}`);
  });

  // Chat: typing indicator
  socket.on('typing', ({ senderId, receiverId }) => {
    io.to(`user-${receiverId}`).emit('user-typing', { userId: senderId });
  });

  socket.on('stop-typing', ({ senderId, receiverId }) => {
    io.to(`user-${receiverId}`).emit('user-stop-typing', { userId: senderId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      delete onlineUsers[socket.userId];
      io.emit('online-users', Object.keys(onlineUsers));
      console.log(`❌ User ${socket.userId} went offline`);
    }
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// Attach io and onlineUsers to app for use in routes
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// Server start
const PORT = process.env.PORT || 5000;
const sendEmail = require('./utils/sendEmail');
const User = require('./models/User');

/**
 * Run one-time startup migrations
 */
const runMigrations = async () => {
  try {
    // Migration: teacher -> faculty
    const result = await User.updateMany(
      { role: 'teacher' },
      { $set: { role: 'faculty' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`🧹 Migration: Updated ${result.modifiedCount} users from 'teacher' to 'faculty'`);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
};

server.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await connectDB();
  await runMigrations();
  await sendEmail.verifyConnection();
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
    console.error(`❌ REASON: You likely have another terminal running 'npm run dev', or a suspended Node process.`);
    console.error(`❌ FIX: Close all other terminals, or run 'npx kill-port ${PORT}' in PowerShell to free it up.\n`);
    process.exit(1);
  } else {
    console.error(err);
    process.exit(1);
  }
});