import { z } from 'zod';

// قواعد تحديث الملف الشخصي
export const UpdateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل').optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    // لاحظ: لا نسمح بتحديث الإيميل هنا لأسباب أمنية
  }),
});

// قواعد تحديث الصورة الشخصية
export const UpdateProfileImageSchema = z.object({
  body: z.object({
    image: z.string().url('رابط الصورة غير صالح'),
  }),
});

// قواعد تغيير كلمة المرور
export const ChangePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ message: 'كلمة المرور الحالية مطلوبة' }),
    newPassword: z
      .string({ message: 'كلمة المرور الجديدة مطلوبة' })
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/^(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير ورقم'),
  }),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>['body'];
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>['body'];