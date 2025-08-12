'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { UserRole } from '@/types/auth.type';

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  return (
    <AuthGuard requiredRole={UserRole.OWNER}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
