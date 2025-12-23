import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // إذا لم يكن الخطأ من نوع AppError، نعتبره خطأ غير متوقع
  if (!(error instanceof AppError)) {
    console.error('💥 UNEXPECTED ERROR:', error);
    error = new AppError('حدث خطأ غير متوقع في الخادم', 500);
  }

  const statusCode = (error as AppError).statusCode || 500;
  const message = error.message;

  res.status(statusCode).json({
    status: (error as AppError).status || 'error',
    message,
    // إظهار التفاصيل فقط في بيئة التطوير
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};