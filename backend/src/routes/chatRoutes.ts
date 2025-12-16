import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
} from '../controllers/chatController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createChat);
router.get('/', getChats);
router.get('/:chatId', getChatById);
router.put('/:chatId', updateChat);
router.delete('/:chatId', deleteChat);

export default router;
