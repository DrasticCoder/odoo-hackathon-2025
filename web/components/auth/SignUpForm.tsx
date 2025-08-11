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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { signUpSchema, SignUpFormData } from '@/validations';
import { AuthService } from '@/services/auth.service';
import { UserRole } from '@/types/auth.type';

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: UserRole.USER,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.signUp(data);
      if (response.data) {
        // Redirect to OTP verification page
        router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`);
      } else if (response.error) {
        // Handle specific error cases
        if (response.error.status === 409) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (response.error.message?.includes('email')) {
          setError('Please enter a valid email address.');
        } else if (response.error.message?.includes('password')) {
          setError('Password must be at least 6 characters long.');
        } else {
          setError(response.error.message || 'Failed to create account. Please try again.');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='mx-auto w-full max-w-md'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Create Account</CardTitle>
        <CardDescription>Enter your information to create your QuickCourt account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='name'>Full Name</Label>
            <Input
              id='name'
              type='text'
              placeholder='John Doe'
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
          </div>

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

          <div className='space-y-2'>
            <Label htmlFor='role'>Account Type</Label>
            <Select value={selectedRole} onValueChange={(value) => setValue('role', value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder='Select account type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.USER}>User - Book sports facilities</SelectItem>
                <SelectItem value={UserRole.OWNER}>Facility Owner - Manage facilities</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className='text-sm text-red-500'>{errors.role.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='avatarUrl'>Avatar URL (Optional)</Label>
            <Input
              id='avatarUrl'
              type='url'
              placeholder='https://example.com/avatar.jpg'
              {...register('avatarUrl')}
              className={errors.avatarUrl ? 'border-red-500' : ''}
            />
            {errors.avatarUrl && <p className='text-sm text-red-500'>{errors.avatarUrl.message}</p>}
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <div className='text-center text-sm text-gray-600'>
            Already have an account?{' '}
            <Link href='/auth/login' className='text-primary font-medium hover:underline'>
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
