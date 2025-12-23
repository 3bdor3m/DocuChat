import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../common/middleware/validate.js';
import { CreateChatSchema, SendMessageSchema } from './chat.schema.js';
import * as chatController from './chat.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(CreateChatSchema), chatController.createChat);
router.get('/', chatController.getChats);
router.get('/:id', chatController.getChat);
router.post('/:id/messages', validate(SendMessageSchema), chatController.sendMessage);
router.delete('/:id', chatController.deleteChat);

export default router;