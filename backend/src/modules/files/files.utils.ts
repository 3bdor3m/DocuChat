import multer from 'multer';
import path from 'path';
import { AppError } from '../../common/utils/AppError.js';
import { config } from '../../config/index.js'; // تأكد أن هذا الملف موجود

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir); // المجلد الذي حددناه في config
  },
  filename: (req, file, cb) => {
    // تسمية فريدة للملف: timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// فلتر للتأكد من أنواع الملفات المسموحة
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  // يمكنك تعديل الأنواع المسموحة هنا أو استيرادها من config
  const allowedTypes = config.allowedFileTypes || ['.pdf', '.txt', '.md', '.docx'];
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('نوع الملف غير مدعوم', 400) as any, false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: (config.maxFileSizeMB || 10) * 1024 * 1024, // الحد الأقصى للحجم
  },
  fileFilter,
});