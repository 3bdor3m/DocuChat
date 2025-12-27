import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
// تأكد أن ملف files.utils.js موجود وفيه إعدادات upload (Multer)
import { upload } from './files.utils.js'; 
import * as fileController from './files.controller.js';

const router = Router();

// تطبيق الحماية على كل الروابط
router.use(authenticate);

// 1. رفع ملف
router.post('/upload', upload.single('file'), fileController.uploadFile);

// 2. جلب قائمة الملفات
router.get('/', fileController.getFiles);

// 3. 👇 هذا الراوت كان ناقص! (مهم جداً للتحديث التلقائي للحالة)
router.get('/:id/status', fileController.getFileStatus);

// 4. حذف ملف
router.delete('/:id', fileController.deleteFile);

export default router;