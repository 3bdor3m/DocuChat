import { Router } from 'express';
import authRoutes from './authRoutes.js';
import fileRoutes from './fileRoutes.js';
import chatRoutes from './chatRoutes.js';
import messageRoutes from './messageRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import activationCodeRoutes from './activationCodeRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/chats', chatRoutes);
router.use('/chats', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activation-codes', activationCodeRoutes);
router.use('/users', userRoutes);

export default router;
