'use client';

//import { OwnerSidebar } from '@/components/OwnerSidebar';

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export function OwnerLayout({ children }: OwnerLayoutProps) {
  return (
    <div className='bg-background flex h-screen'>
      {/* <OwnerSidebar /> */}
      <main className='flex-1 overflow-auto'>{children}</main>
    </div>
  );
}
