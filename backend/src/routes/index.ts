import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import fileRoutes from '../modules/files/files.routes.js';
import chatRoutes from '../modules/chat/chat.routes.js';
import notificationRoutes from './notificationRoutes.js';
import activationCodeRoutes from './activationCodeRoutes.js';
import userRoutes from '../modules/users/users.routes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/chats', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activation-codes', activationCodeRoutes);
router.use('/users', userRoutes);

export default router;
