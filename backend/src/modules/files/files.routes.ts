import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { upload } from './files.utils.js';
import * as fileController from './files.controller.js';

const router = Router();

router.use(authenticate);

// upload.single('file') هو الـ Middleware الخاص بـ Multer
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.getFiles);
router.delete('/:id', fileController.deleteFile);

export default router;