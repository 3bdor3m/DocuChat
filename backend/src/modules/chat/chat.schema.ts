import { z } from 'zod';

export const CreateChatSchema = z.object({
  body: z.object({
    fileId: z.string().uuid().optional().nullable(),
    title: z.string().optional(),
  }),
});

export const SendMessageSchema = z.object({
  body: z.object({
    content: z.string({ message: 'محتوى الرسالة مطلوب' }).min(1),
  }),
});

export const UpdateChatSchema = z.object({
  body: z.object({
    title: z.string().min(1),
  }),
});