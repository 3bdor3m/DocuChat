import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync.js';
import { fileService } from './files.service.js';
import { AppError } from '../../common/utils/AppError.js';
import { AuthRequest } from '../../middleware/auth.js';

export const uploadFile = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('الرجاء اختيار ملف لرفعه', 400);
  }

  const fileRecord = await fileService.uploadFile(req.user!.userId, req.file);

  res.status(201).json({
    status: 'success',
    message: 'تم رفع الملف وجاري معالجته',
    data: {
      id: fileRecord.id,
      filename: fileRecord.originalFilename,
      status: fileRecord.status,
    },
  });
});

export const getFiles = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const result = await fileService.getUserFiles(req.user!.userId, page);
  res.json({ status: 'success', data: result });
});

export const deleteFile = catchAsync(async (req: AuthRequest, res: Response) => {
  await fileService.deleteFile(req.user!.userId, req.params.id);
  res.status(204).send();
});