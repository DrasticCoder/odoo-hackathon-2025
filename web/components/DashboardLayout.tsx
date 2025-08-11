'use client';

import { DashboardSidebar } from '@/components/DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className='bg-background flex h-screen'>
      <DashboardSidebar />
      <main className='bg-background flex-1 overflow-auto'>{children}</main>
    </div>
  );
}
