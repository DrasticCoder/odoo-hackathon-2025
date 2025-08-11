import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Unauthorized - QuickCourt',
  description: 'You do not have permission to access this page',
};

export default function UnauthorizedPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <Card className='mx-auto w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mb-4 flex justify-center'>
            <AlertTriangle className='h-12 w-12 text-red-500' />
          </div>
          <CardTitle className='text-2xl font-bold'>Access Denied</CardTitle>
          <CardDescription>You don&apos;t have permission to access this page</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-gray-600'>Please contact an administrator if you believe this is an error.</p>
          <div className='space-y-2'>
            <Button asChild className='w-full'>
              <Link href='/'>Go to Home</Link>
            </Button>
            <Button asChild variant='outline' className='w-full'>
              <Link href='/auth/login'>Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
