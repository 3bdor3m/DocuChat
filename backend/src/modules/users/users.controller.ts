import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync.js';
import { userService } from './users.service.js';
import { AuthRequest } from '../../middleware/auth.js'; // سنقوم بتحديث هذا الملف لاحقاً ليكون في common

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await userService.getMe(req.user!.userId);
  res.json(user);
});

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const updatedUser = await userService.updateProfile(req.user!.userId, req.body);
  res.json({ status: 'success', data: updatedUser });
});

export const updateProfileImage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { imageUrl } = req.body;
  await userService.updateProfileImage(req.user!.userId, imageUrl);
  res.json({ status: 'success', message: 'تم تحديث الصورة بنجاح' });
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
  await userService.deleteAccount(req.user!.userId);
  res.status(204).send();
});