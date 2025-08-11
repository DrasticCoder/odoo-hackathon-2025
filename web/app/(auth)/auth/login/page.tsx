import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login - QuickCourt',
  description: 'Sign in to your QuickCourt account',
};

export default function LoginPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>QuickCourt</h1>
          <p className='mt-2 text-gray-600'>Book your favorite sports facilities</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
