'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { UserRole } from '@/types/auth.type';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requiredRole, requireAuth = true }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    setIsLoading(false);
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated && user && !user.isVerified) {
      router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`);
      return;
    }

    if (requiredRole && user) {
      const userRole = user.role;
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (userRole === UserRole.ADMIN) {
        return;
      }

      if (!allowedRoles.includes(userRole)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, requireAuth, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // Show loading if redirecting
  if (requireAuth && !isAuthenticated) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // Show loading if user is not verified
  if (isAuthenticated && user && !user.isVerified) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return <>{children}</>;
}
