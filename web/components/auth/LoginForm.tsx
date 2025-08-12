'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import { loginSchema, LoginFormData } from '@/validations';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store';
import { UserRole } from '@/types/auth.type';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.login(data);
      if (response.data) {
        const { user, token } = response.data;
        login(user, token);

        // redirect to respective dashboard= jiya
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
      } else if (response.error) {
        // Handle specific error cases
        if (response.error.status === 401) {
          setError('Invalid email or password. Please check your credentials.');
        } else if (response.error.message?.includes('verify')) {
          setError('Please verify your email first. Check your inbox for the verification link.');
        } else {
          setError(response.error.message || 'Login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='mx-auto w-full max-w-md'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Welcome Back</CardTitle>
        <CardDescription>Sign in to your QuickCourt account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='john@example.com'
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className='text-sm text-red-500'>{errors.email.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                {...register('password')}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 flex items-center pr-3'
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4 text-gray-400' />
                ) : (
                  <Eye className='h-4 w-4 text-gray-400' />
                )}
              </button>
            </div>
            {errors.password && <p className='text-sm text-red-500'>{errors.password.message}</p>}
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <Separator className='my-4' />

          <div className='space-y-2 text-center'>
            <div className='text-sm text-gray-600'>
              Don&apos;t have an account?{' '}
              <Link href='/auth/signup' className='text-primary font-medium hover:underline'>
                Sign up
              </Link>
            </div>
            {/* <div className='text-sm text-gray-600'>
              <Link href='/auth/otp' className='text-primary font-medium hover:underline'>
                Sign in with OTP instead
              </Link>
            </div> */}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
