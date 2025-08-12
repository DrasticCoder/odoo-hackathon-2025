'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { UserRole } from '@/types/auth.type';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const Page = () => {
  const { isAuthenticated, user, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      switch (user.role) {
        case UserRole.ADMIN:
          router.push('/admin/dashboard');
          break;
        case UserRole.OWNER:
          router.push('/owner/dashboard');
          break;
        case UserRole.USER:
          router.push('/user/dashboard');
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='animate-spin' />
        <p className='ml-3 text-sm font-medium'>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4'>
        <div className='max-w-md space-y-6 text-center'>
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold text-gray-900'>QuickCourt</h1>
            <p className='text-xl text-gray-600'>Book Your Favorite Sports Facilities</p>
            <p className='text-gray-500'>
              Find and book badminton courts, tennis courts, football grounds, and more near you.
            </p>
          </div>

          <div className='space-y-3'>
            <Button asChild size='lg' className='w-full'>
              <Link href='/auth/login'>Sign In</Link>
            </Button>
            <Button asChild variant='outline' size='lg' className='w-full'>
              <Link href='/auth/signup'>Create Account</Link>
            </Button>
          </div>

          <div className='border-t pt-4'>
            <p className='text-sm text-gray-500'>
              Join thousands of sports enthusiasts who trust QuickCourt for their bookings
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen items-center justify-center'>
      <Loader2 className='animate-spin' />
      <p className='ml-3 text-sm font-medium'>Redirecting...</p>
    </div>
  );
};

export default Page;
