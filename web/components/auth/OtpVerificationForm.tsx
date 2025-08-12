'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { verifyOtpSchema, VerifyOtpFormData } from '@/validations';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store';
import { UserRole } from '@/types/auth.type';

export default function OtpVerificationForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email,
    },
  });

  useEffect(() => {
    if (email) {
      setValue('email', email);
    }
  }, [email, setValue]);

  const onSubmit = async (data: VerifyOtpFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await AuthService.verifyOtp(data);
      if (response.data) {
        const { user, token } = response.data;
        login(user, token);
        setSuccess('Email verified successfully! Redirecting...');

        // Redirect based on user role
        setTimeout(() => {
          switch (user.role) {
            case UserRole.ADMIN:
              router.push('/admin/dashboard');
              break;
            case UserRole.OWNER:
              router.push('/owner/dashboard');
              break;
            default:
              router.push('/user/dashboard');
              break;
          }
        }, 1000);
      } else if (response.error) {
        // Handle specific error cases
        if (response.error.status === 401) {
          if (response.error.message?.includes('expired')) {
            setError('OTP has expired. Please request a new one.');
          } else {
            setError('Invalid OTP. Please check the code and try again.');
          }
        } else {
          setError(response.error.message || 'Failed to verify OTP. Please try again.');
        }
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setIsResending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await AuthService.resendVerificationOtp({ email });
      if (response.data) {
        setSuccess('OTP sent successfully! Check your email.');
      } else if (response.error) {
        if (response.error.status === 409) {
          setError('User is already verified.');
        } else if (response.error.status === 404) {
          setError('User not found. Please sign up first.');
        } else {
          setError(response.error.message || 'Failed to resend OTP. Please try again.');
        }
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className='mx-auto w-full max-w-md'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Verify Your Email</CardTitle>
        <CardDescription>Enter the 6-digit OTP sent to your email address</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className='text-green-600'>{success}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' {...register('email')} disabled className='bg-gray-50' />
            {errors.email && <p className='text-sm text-red-500'>{errors.email.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='otp'>OTP Code</Label>
            <Input
              id='otp'
              type='text'
              placeholder='Enter 6-digit OTP'
              maxLength={6}
              {...register('otp')}
              className={errors.otp ? 'border-red-500' : ''}
            />
            {errors.otp && <p className='text-sm text-red-500'>{errors.otp.message}</p>}
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </Button>

          <div className='text-center'>
            <Button
              type='button'
              variant='ghost'
              onClick={handleResendOtp}
              disabled={isResending || !email}
              className='text-sm'
            >
              {isResending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Resending...
                </>
              ) : (
                'Resend OTP'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
