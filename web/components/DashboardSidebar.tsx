'use client';
import { adminRoutes, ownerRoutes, userRoutes } from '@/config/dashboard-sidebar';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeft, LogOut, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
  isActive?: boolean;
}

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const userRole = session?.user?.role;

  // Define navigation items based on user role
  const getNavigationItems = (): SidebarItem[] => {
    const role = userRole ?? 'USER';
    const routes = role === 'ADMIN' ? adminRoutes : role === 'OWNER' ? ownerRoutes : userRoutes;
    return routes.map((r) => ({
      icon: r.icon as SidebarItem['icon'],
      label: r.title,
      href: r.link,
    }));
  };

  const navigationItems = getNavigationItems();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'USER':
        return 'bg-blue-100 text-blue-700';
      case 'OWNER':
        return 'bg-green-100 text-green-700';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    router.push('/login');
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
            <div className='flex h-8 w-8 items-center justify-center rounded bg-orange-500 font-bold text-white'>Q</div>
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
            <AvatarImage src={session?.user?.avatarUrl || ''} />
            <AvatarFallback>{session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className='flex-1 overflow-hidden'>
              <p className='truncate text-sm font-medium'>{session?.user?.name || 'User'}</p>
              <div className='flex items-center gap-2'>
                <Badge variant='secondary' className={cn('text-xs', getRoleColor(userRole || ''))}>
                  {userRole}
                </Badge>
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
          const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;

          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3',
                isCollapsed ? 'px-2' : 'px-3',
                isActive && 'bg-orange-100 text-orange-700 hover:bg-orange-200'
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
          onClick={() => handleNavigation('/settings')}
        >
          <Settings className='h-4 w-4 shrink-0' />
          {!isCollapsed && <span>Settings</span>}
        </Button>

        <Button
          variant='ghost'
          className={cn(
            'w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700',
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
