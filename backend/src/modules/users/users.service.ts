import { PrismaClient } from '@prisma/client';
// ❌ تم حذف axios لأنه غير مطلوب هنا
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

  // backend/src/modules/users/users.service.ts

  // 👇 دالة جديدة لتصدير بيانات المستخدم
  async exportUserData(userId: string) {
    // نجلب المستخدم مع علاقاته (إذا كانت موجودة في قاعدة البيانات)
    // هنا نجلب البيانات الأساسية، ويمكنك إضافة files: true أو chats: true إذا أردت تصدير كل شيء
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        subscriptionTier: true,
        // يمكنك إضافة جداول أخرى هنا إذا كانت علاقات Prisma معرفة
        files: { select: { filename: true, createdAt: true } },
        chats: { select: { title: true, createdAt: true } }
      }
    });

    if (!user) throw new AppError('المستخدم غير موجود', 404);
    return user;
  }

  // 🔥🔥🔥 التعديل الجذري هنا 🔥🔥🔥
  // تحديث الصورة الشخصية
  async updateProfileImage(userId: string, base64Image: string) {
    // نستخدم Prisma للتعامل مع الداتا بيس مباشرة
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: base64Image, // حفظ النص القادم من الفرونت إند
      },
      select: {
        id: true,
        fullName: true,
        profileImage: true, // نرجع الصورة الجديدة للتأكيد
      },
    });

    return updatedUser;
  }

  async deleteProfileImage(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { profileImage: null }, // نجعل القيمة null في قاعدة البيانات
      select: { id: true, profileImage: true },
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
  async deleteAccount(userId: string, password: any) {
    await prisma.user.delete({ where: { id: userId } });
  }
}

export const userService = new UserService();