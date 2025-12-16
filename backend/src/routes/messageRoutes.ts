import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/:chatId/messages', sendMessage);
router.get('/:chatId/messages', getMessages);

export default router;
