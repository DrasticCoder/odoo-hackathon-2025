'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Calendar,
  ChevronLeft,
  Home,
  LogOut,
  Menu,
  Settings,
  Building2,
  BarChart3,
  Users,
  Shield,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks';
import { useAuthStore } from '@/store/auth.store';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
}

interface OwnerSidebarProps {
  className?: string;
}

export function OwnerSidebar({ className }: OwnerSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const user = useCurrentUser();
  const { logout } = useAuthStore();

  const navigationItems: SidebarItem[] = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/owner/dashboard',
    },
    {
      icon: Building2,
      label: 'Facilities',
      href: '/owner/facilities',
    },
    {
      icon: Shield,
      label: 'Courts',
      href: '/owner/courts',
    },
    {
      icon: Calendar,
      label: 'Bookings',
      href: '/owner/bookings',
    },
    {
      icon: CalendarClock,
      label: 'Time Slots',
      href: '/owner/availability',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      href: '/owner/analytics',
    },
    {
      icon: Users,
      label: 'Customers',
      href: '/owner/customers',
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleSignOut = async () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div
      className={cn(
        'bg-card flex h-screen flex-col border-r transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className='flex h-16 items-center border-b px-4'>
        {!isCollapsed && (
          <div className='flex items-center gap-2'>
            <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded font-bold'>
              Q
            </div>
            <span className='text-lg font-semibold'>QuickCourt</span>
          </div>
        )}
        <Button variant='ghost' size='icon' className='ml-auto' onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <Menu className='h-4 w-4' /> : <ChevronLeft className='h-4 w-4' />}
        </Button>
      </div>

      {/* User Info */}
      <div className='p-4'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={user?.avatarUrl || ''} />
            <AvatarFallback className='bg-primary text-primary-foreground'>
              {user?.name?.charAt(0)?.toUpperCase() || 'O'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className='flex-1 overflow-hidden'>
              <p className='truncate text-sm font-medium'>{user?.name || 'Owner'}</p>
              <div className='flex items-center gap-2'>
                <Badge variant='secondary' className='text-xs'>
                  {user?.role}
                </Badge>
                {user?.isVerified && <div className='bg-primary h-2 w-2 rounded-full' title='Verified' />}
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className='flex-1 space-y-1 p-2'>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3',
                isCollapsed ? 'px-2' : 'px-3',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
              )}
              onClick={() => handleNavigation(item.href)}
            >
              <Icon className='h-4 w-4 shrink-0' />
              {!isCollapsed && (
                <>
                  <span className='truncate'>{item.label}</span>
                  {item.badge && (
                    <Badge variant='destructive' className='ml-auto text-xs'>
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          );
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className='space-y-1 p-2'>
        <Button
          variant='ghost'
          className={cn('w-full justify-start gap-3', isCollapsed ? 'px-2' : 'px-3')}
          onClick={() => handleNavigation('/owner/settings')}
        >
          <Settings className='h-4 w-4 shrink-0' />
          {!isCollapsed && <span>Settings</span>}
        </Button>

        <Button
          variant='ghost'
          className={cn(
            'text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-3',
            isCollapsed ? 'px-2' : 'px-3'
          )}
          onClick={handleSignOut}
        >
          <LogOut className='h-4 w-4 shrink-0' />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
