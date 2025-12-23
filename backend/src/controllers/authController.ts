// backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateResetToken } from '../common/utils/password.js';
import { generateToken } from '../common/utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

// ... (دالة register تبقى كما هي دون تغيير) ...
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    let { email, password, fullName } = req.body;
    email = email?.trim().toLowerCase();
    fullName = fullName?.trim();

    if (!email || !password || !fullName) {
      throw new AppError('جميع الحقول مطلوبة', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('صيغة البريد الإلكتروني غير صحيحة', 400);
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new AppError('كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير ورقم', 400);
    }

    if (fullName.length < 3) {
      throw new AppError('الاسم الكامل يجب أن يكون 3 أحرف على الأقل', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('البريد الإلكتروني مستخدم بالفعل', 400);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        isVerified: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في التسجيل', 500);
  }
};

// Login user - تم التعديل هنا
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('البريد الإلكتروني وكلمة المرور مطلوبان', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('بيانات الدخول غير صحيحة', 401);
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('بيانات الدخول غير صحيحة', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('الحساب غير نشط', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // إعداد خيارات الكوكيز
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
      maxAge: 3600 * 1000, // ساعة واحدة
    };

    // إرسال التوكن في الكوكيز (للأمان الإضافي)
    res.cookie('jwt', token, cookieOptions);

    // إرسال الرد النهائي مع التوكن (ليستخدمه الـ Frontend)
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      accessToken: token,        // <--- هذا السطر كان مفقوداً
      tokenType: 'Bearer',       // <--- مطلوب حسب واجهة الـ Frontend
      expiresIn: 3600,           // <--- مطلوب حسب واجهة الـ Frontend
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        subscriptionTier: user.subscriptionTier,
      },
    });

  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في تسجيل الدخول', 500);
  }
};

// ... (باقي الدوال getMe, forgotPassword, resetPassword تبقى كما هي) ...
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        isVerified: true,
        subscriptionTier: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new AppError('المستخدم غير موجود', 404);
    }

    res.json(user);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في جلب بيانات المستخدم', 500);
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.json({ message: 'إذا كان البريد موجوداً، سيتم إرسال رابط إعادة التعيين' });
      return;
    }

    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    res.json({ message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' });
  } catch (error) {
    throw new AppError('خطأ في إرسال رابط إعادة التعيين', 500);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const resetToken = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetToken) {
      throw new AppError('رابط إعادة التعيين غير صالح أو منتهي الصلاحية', 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في إعادة تعيين كلمة المرور', 500);
  }
};