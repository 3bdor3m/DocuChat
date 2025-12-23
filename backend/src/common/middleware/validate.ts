import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // تجميع رسائل الخطأ بشكل مقروء
        const errorMessages = error.issues.map((issue) => {
          return `${issue.path.join('.')}: ${issue.message}`;
        }).join(', ');

        next(new AppError(`بيانات غير صالحة: ${errorMessages}`, 400));
      } else {
        next(error);
      }
    }
  };