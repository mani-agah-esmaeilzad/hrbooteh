import { z } from 'zod';

// Schema برای ورود کاربر
export const loginSchema = z.object({
  username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

// Schema برای ثبت‌نام کاربر
export const registerSchema = z.object({
  username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد'),
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  password_confirmation: z.string(),
  first_name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  last_name: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  phone_number: z.string().optional().nullable(),
  age: z.string().optional().nullable().or(z.number().min(1).max(120).optional().nullable()),
  education_level: z.string().optional().nullable(),
  work_experience: z.string().optional().nullable(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "رمزهای عبور یکسان نیستند",
  path: ["password_confirmation"],
});

// Schema برای درخواست چت
export const chatRequestSchema = z.object({
  message: z.string().min(1, 'پیام نمی‌تواند خالی باشد'),
  session_id: z.string().min(1, 'شناسه جلسه معتبر نیست'),
  assessment_id: z.string().optional(),
});

// Schema برای پاسخ API
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
