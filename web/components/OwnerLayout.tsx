'use client';

import { OwnerSidebar } from '@/components/OwnerSidebar';

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export function OwnerLayout({ children }: OwnerLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <OwnerSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
