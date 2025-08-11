'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import Settings from '@/components/common/Settings';
import { UserRole } from '@/types/auth.type';

export default function SettingsPage() {
  return (
    <AuthGuard requiredRole={[UserRole.ADMIN, UserRole.OWNER]}>
      <DashboardLayout>
        <div className="bg-background min-h-[calc(100vh-0px)]">
          <Settings />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
