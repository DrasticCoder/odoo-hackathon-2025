'use client';

import { DashboardSidebar } from '@/components/DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className='flex h-screen bg-gray-50'>
      <DashboardSidebar />
      <main className='flex-1 overflow-auto'>{children}</main>
    </div>
  );
}
