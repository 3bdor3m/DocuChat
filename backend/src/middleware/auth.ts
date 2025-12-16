import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';

// تعريف نوع البيانات المضاف للـ Request
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    // 1. محاولة قراءة التوكن من الكوكيز (الأولوية للأمان)
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    // 2. محاولة قراءة التوكن من الـ Header (للمرونة، مثلاً لو تطبيق موبايل)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('يرجى تسجيل الدخول للوصول إلى هذا المحتوى', 401);
    }

    // التحقق من صحة التوكن
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      email: string;
    };

    // إضافة بيانات المستخدم للطلب
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    next(new AppError('جلسة غير صالحة، يرجى إعادة تسجيل الدخول', 401));
  }
}