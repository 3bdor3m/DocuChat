import { z } from 'zod';

// قواعد التسجيل
export const RegisterSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'البريد الإلكتروني مطلوب' })
      .email('صيغة البريد الإلكتروني غير صحيحة')
      .toLowerCase()
      .trim(),
    password: z
      .string({ message: 'كلمة المرور مطلوبة' })
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/^(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير ورقم'),
    fullName: z
      .string({ message: 'الاسم الكامل مطلوب' })
      .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
      .trim(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
});

// قواعد تسجيل الدخول
export const LoginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'البريد الإلكتروني مطلوب' })
      .email('بريد إلكتروني غير صالح'),
    password: z
      .string({ message: 'كلمة المرور مطلوبة' }),
  }),
});

// تصدير الأنواع (Types) لاستخدامها في الكود
export type RegisterDto = z.infer<typeof RegisterSchema>['body'];
export type LoginDto = z.infer<typeof LoginSchema>['body'];