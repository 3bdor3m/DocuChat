import { PrismaClient } from '@prisma/client';
import { RegisterDto, LoginDto } from './auth.schema.js';
import { AppError } from '../../common/utils/AppError.js';
import { hashPassword, comparePassword } from '../../common/utils/password.js'; // تأكد من المسار
import { generateToken } from '../../common/utils/jwt.js'; // تأكد من المسار

const prisma = new PrismaClient();

export class AuthService {
  
  // خدمة التسجيل
  async register(data: RegisterDto) {
    // 1. التحقق من التكرار
    const existingUser = await prisma.user.findUnique({ 
      where: { email: data.email } 
    });
    
    if (existingUser) {
      throw new AppError('البريد الإلكتروني مستخدم بالفعل', 400);
    }

    // 2. تشفير كلمة المرور
    const passwordHash = await hashPassword(data.password);

    // 3. إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: { // لا نرجع كلمة المرور أبداً
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    return user;
  }

  // خدمة تسجيل الدخول
  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({ 
      where: { email: data.email } 
    });

    if (!user || !(await comparePassword(data.password, user.passwordHash))) {
      throw new AppError('بيانات الدخول غير صحيحة', 401);
    }

    if (!user.isActive) {
      throw new AppError('الحساب غير نشط', 401);
    }

    // تحديث آخر ظهور
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // إنشاء التوكن
    const token = generateToken({ userId: user.id, email: user.email });

    return { 
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        subscriptionTier: user.subscriptionTier,
      }, 
      token 
    };
  }
}

export const authService = new AuthService();