import { Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync.js';
// 👇 التصحيح هنا: استيراد filesService (التي تبدأ بحرف صغير)
import { filesService } from './files.service.js';
import { AppError } from '../../common/utils/AppError.js';
import { AuthRequest } from '../../middleware/auth.js';

// 1. رفع ملف جديد
export const uploadFile = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('الرجاء اختيار ملف لرفعه', 400);
  }

  // 👇 التصحيح: استخدام filesService
  const fileRecord = await filesService.uploadFile(req.user!.userId, req.file);

  res.status(201).json({
    status: 'success',
    message: 'تم رفع الملف وجاري معالجته',
    data: {
      id: fileRecord.id,
      filename: fileRecord.originalFilename,
      status: fileRecord.status,
      fileSize: Number(fileRecord.fileSize), // تحويل BigInt لرقم عادي
      createdAt: fileRecord.createdAt
    },
  });
});

// 2. جلب كل ملفات المستخدم (مع Pagination)
export const getFiles = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  
  // 👇 التصحيح: استخدام filesService
  const result = await filesService.getUserFiles(req.user!.userId, page, limit);
  
  res.json({ 
    status: 'success', 
    data: result 
  });
});

// 3. جلب حالة ملف معين (للتحديث التلقائي في الواجهة)
export const getFileStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  // 👇 التصحيح: استخدام filesService
  const statusData = await filesService.getFileStatus(req.user!.userId, req.params.id);
  
  res.json({
    status: 'success',
    data: statusData
  });
});

// 4. حذف ملف
export const deleteFile = catchAsync(async (req: AuthRequest, res: Response) => {
  // 👇 التصحيح: استخدام filesService
  await filesService.deleteFile(req.user!.userId, req.params.id);
  res.status(204).send();
});