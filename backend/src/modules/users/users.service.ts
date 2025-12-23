import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/utils/AppError.js';
import { hashPassword, comparePassword } from '../../common/utils/password.js';
import { UpdateProfileDto, ChangePasswordDto } from './users.schema.js';

const prisma = new PrismaClient();

export class UserService {
  // جلب بيانات المستخدم الحالي
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        subscriptionTier: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) throw new AppError('المستخدم غير موجود', 404);
    return user;
  }

  // تحديث البيانات الأساسية
  async updateProfile(userId: string, data: UpdateProfileDto) {
    return await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, fullName: true, firstName: true, lastName: true },
    });
  }

  // تحديث الصورة الشخصية
  async updateProfileImage(userId: string, imageUrl: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
    });
  }

  // تغيير كلمة المرور
  async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('المستخدم غير موجود', 404);

    // التحقق من كلمة المرور القديمة
    const isMatch = await comparePassword(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('كلمة المرور الحالية غير صحيحة', 400);
    }

    // تشفير وحفظ الجديدة
    const newHash = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }

  // الحصول على الإحصائيات
  async getUserStats(userId: string) {
    const [filesCount, chatsCount] = await Promise.all([
      prisma.file.count({ where: { userId } }),
      prisma.chat.count({ where: { userId } }),
    ]);

    return { filesCount, chatsCount };
  }

  // حذف الحساب
  async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }
}

export const userService = new UserService();