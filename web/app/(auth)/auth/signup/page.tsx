import { Metadata } from 'next';
import SignUpForm from '@/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up - QuickCourt',
  description: 'Create your QuickCourt account',
};

export default function SignUpPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>QuickCourt</h1>
          <p className='mt-2 text-gray-600'>Book your favorite sports facilities</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
