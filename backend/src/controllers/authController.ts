import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateResetToken } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

// Register new user
// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    let { email, password, fullName } = req.body;

    // 1. تنظيف البيانات (Trim)
    email = email?.trim().toLowerCase(); // توحيد حالة الأحرف
    fullName = fullName?.trim();

    // 2. التحقق من وجود البيانات
    if (!email || !password || !fullName) {
      throw new AppError('جميع الحقول مطلوبة', 400);
    }

    // 3. التحقق من صحة البريد الإلكتروني (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('صيغة البريد الإلكتروني غير صحيحة', 400);
    }

    // 4. شروط كلمة المرور (8 أحرف + حرف كبير + رقم)
    // الشرح: (?=.*[A-Z]) يعني حرف كبير، (?=.*\d) يعني رقم، {8,} يعني الطول
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new AppError('كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير ورقم', 400);
    }

    // 5. شروط الاسم
    if (fullName.length < 3) {
      throw new AppError('الاسم الكامل يجب أن يكون 3 أحرف على الأقل', 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('البريد الإلكتروني مستخدم بالفعل', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
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

// Login user
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

    // إرسال التوكن في الكوكيز
    res.cookie('jwt', token, cookieOptions);

    // إرسال الرد النهائي
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
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

// Get current user
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

// Forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'إذا كان البريد موجوداً، سيتم إرسال رابط إعادة التعيين' });
      return;
    }

    // Generate reset token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // TODO: Send email with reset link
    // await sendResetEmail(user.email, token);

    res.json({ message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' });
  } catch (error) {
    throw new AppError('خطأ في إرسال رابط إعادة التعيين', 500);
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // Find valid reset token
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

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Mark token as used
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