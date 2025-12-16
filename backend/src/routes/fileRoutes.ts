import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import {
  uploadFile,
  getFiles,
  getFileById,
  deleteFile,
  getFileStatus,
} from '../controllers/fileController.js';
import { config } from '../config/index.js';

const router = Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeMB * 1024 * 1024, // Convert MB to bytes
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/', getFiles);
router.get('/:fileId', getFileById);
router.delete('/:fileId', deleteFile);
router.get('/:fileId/status', getFileStatus);

export default router;
