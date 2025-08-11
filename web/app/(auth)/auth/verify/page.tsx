import { Metadata } from 'next';
import { Suspense } from 'react';
import OtpVerificationForm from '@/components/auth/OtpVerificationForm';

export const metadata: Metadata = {
  title: 'Verify Email - QuickCourt',
  description: 'Verify your email address',
};

export default function VerifyPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>QuickCourt</h1>
          <p className='mt-2 text-gray-600'>Verify your account to continue</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <OtpVerificationForm />
        </Suspense>
      </div>
    </div>
  );
}
