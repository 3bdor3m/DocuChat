import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config/index.js';
import { verifyToken } from './common/utils/jwt.js';

const PORT = config.port;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    credentials: true,
  },
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new Error('Invalid token'));
  }

  (socket as any).userId = decoded.userId;
  next();
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  const userId = (socket as any).userId;
  console.log(`User connected: ${userId}`);

  // Join user-specific room
  socket.join(`user:${userId}`);

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
  });
});

// Make io available globally for notification emission
(global as any).io = io;

// Start server
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   ${config.appName}                    
║   Environment: ${config.nodeEnv}
║   Port: ${PORT}
║   API: http://localhost:${PORT}/api/v1
║   WebSocket: ws://localhost:${PORT}
║   AI Model: ${config.geminiModel}
║   Approach: Gemini Long Context
╚═══════════════════════════════════════════════════════╝
  `);
});
