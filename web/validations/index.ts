import { z } from 'zod';
import { UserRole } from '@/types/auth.type';

// Auth validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: z.nativeEnum(UserRole).optional(),
  avatarUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  recaptchaToken: z.string().min(1, 'Please complete the reCAPTCHA verification'),
});

export const otpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

// Type definitions for form data
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
