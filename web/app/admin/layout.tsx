'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { UserRole } from '@/types/auth.type';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard requiredRole={UserRole.ADMIN}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
