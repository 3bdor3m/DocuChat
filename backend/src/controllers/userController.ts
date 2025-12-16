import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

// Get user stats
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get files count
    const filesCount = await prisma.file.count({
      where: { userId },
    });

    // Get chats count
    const chatsCount = await prisma.chat.count({
      where: { userId },
    });

    // Get messages count
    const messagesCount = await prisma.message.count({
      where: {
        chat: {
          userId,
        },
      },
    });

    // Get total file size
    const files = await prisma.file.findMany({
      where: { userId },
      select: { fileSize: true },
    });

    const totalFileSize = files.reduce((sum, file) => sum + Number(file.fileSize), 0);

    res.json({
      filesCount,
      chatsCount,
      messagesCount,
      totalFileSize,
    });
  } catch (error) {
    throw new AppError('خطأ في جلب الإحصائيات', 500);
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new AppError('البريد الإلكتروني مستخدم بالفعل', 400);
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        fullName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        profileImage: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في تحديث الملف الشخصي', 500);
  }
};

// Update profile image
export const updateProfileImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { profileImage } = req.body;

    if (!profileImage) {
      throw new AppError('الصورة مطلوبة', 400);
    }

    // Update user profile image
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage },
      select: {
        id: true,
        profileImage: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في تحديث الصورة الشخصية', 500);
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('كلمة المرور الحالية والجديدة مطلوبتان', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('المستخدم غير موجود', 404);
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('كلمة المرور الحالية غير صحيحة', 401);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في تغيير كلمة المرور', 500);
  }
};

// Delete account
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { password } = req.body;

    if (!password) {
      throw new AppError('كلمة المرور مطلوبة للتأكيد', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('المستخدم غير موجود', 404);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('كلمة المرور غير صحيحة', 401);
    }

    // Delete user (cascade will delete all related data)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'تم حذف الحساب بنجاح' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في حذف الحساب', 500);
  }
};

// Export user data
export const exportUserData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    // Get files
    const files = await prisma.file.findMany({
      where: { userId },
      select: {
        id: true,
        filename: true,
        originalFilename: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });

    // Get chats with messages
    const chats = await prisma.chat.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        messages: {
          select: {
            id: true,
            messageType: true,
            content: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    const exportData = {
      user,
      files,
      chats,
      exportDate: new Date().toISOString(),
    };

    res.json(exportData);
  } catch (error) {
    throw new AppError('خطأ في تصدير البيانات', 500);
  }
};
