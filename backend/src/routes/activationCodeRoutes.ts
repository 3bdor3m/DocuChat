import { Router } from 'express';
import { activateCode, generateActivationCodes } from '../controllers/activationCodeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/activate', authenticate, activateCode);
router.post('/generate', generateActivationCodes);

export default router;