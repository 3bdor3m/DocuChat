import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync.js';
import { userService } from './users.service.js';
import { AppError } from '../../common/utils/AppError.js';
import { AuthRequest } from '../../middleware/auth.js';

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await userService.getMe(req.user!.userId);
  res.json(user);
});

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const updatedUser = await userService.updateProfile(req.user!.userId, req.body);
  res.json({ status: 'success', data: updatedUser });
});

// 🔥 الدالة التي تم إصلاحها لرفع الصورة
export const updateProfileImage = catchAsync(async (req: AuthRequest, res: Response) => {
  // 1. استقبال 'image' لأننا نرسل Base64 من الفرونت إند
  const { image } = req.body;

  if (!image) {
    throw new AppError('لا توجد صورة في الطلب', 400);
  }

  // 2. تمرير userId (الموجود في الميدلوير) والصورة للسيرفس
  const updatedUser = await userService.updateProfileImage(req.user!.userId, image);

  res.json({
    status: 'success',
    data: updatedUser,
    message: 'تم تحديث الصورة بنجاح'
  });
});

export const deleteProfileImage = catchAsync(async (req: AuthRequest, res: Response) => {
  await userService.deleteProfileImage(req.user!.userId);
  res.json({
    status: 'success',
    message: 'تم حذف الصورة بنجاح',
    data: { profileImage: null }
  });
});

export const changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
  await userService.changePassword(req.user!.userId, req.body);
  res.json({ status: 'success', message: 'تم تغيير كلمة المرور بنجاح' });
});

export const getStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const stats = await userService.getUserStats(req.user!.userId);
  res.json(stats);
});

export const deleteAccount = catchAsync(async (req: AuthRequest, res: Response) => {
  // نستقبل السبب أيضاً (حتى لو لم نستخدمه حالياً في قاعدة البيانات)
  const { password, reason } = req.body; 
  
  // دالة الحذف في السيرفس تحتاج فقط للتحقق من الباسورد حالياً
  // يمكنك لاحقاً تمرير "reason" للسيرفس لحفظه في سجل خاص
  await userService.deleteAccount(req.user!.userId, password); 
  
  res.status(204).send();
});

export const exportData = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await userService.exportUserData(req.user!.userId);
  
  res.json({
    status: 'success',
    data: data,
    generatedAt: new Date().toISOString()
  });
});