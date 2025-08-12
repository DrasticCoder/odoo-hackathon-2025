'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, Settings, ChevronDown, Home } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store';
import { getDashboardConfig } from '@/config/dashboard.config';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UniversalSearch } from '@/components/common/UniversalSearch';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  if (!user) {
    return <div>Loading...</div>;
  }

  const config = getDashboardConfig(user.role);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const SidebarContent = ({ className }: { className?: string }) => (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Logo/Brand */}
      <div className='flex h-16 items-center border-b px-6'>
        <Link
          href={user.role === 'ADMIN' ? '/admin/dashboard' : '/owner/dashboard'}
          className='flex items-center space-x-2'
        >
          <div className='bg-primary flex h-8 w-8 items-center justify-center rounded-lg'>
            <Home className='text-primary-foreground h-5 w-5' />
          </div>
          <span className='text-lg font-semibold'>QuickCourt</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className='flex-1 px-3 py-4'>
        <div className='space-y-1'>
          {config.sidebarNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className='h-4 w-4' />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant='secondary' className='ml-auto text-xs'>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        <Separator className='my-4' />

        {/* Quick Actions */}
        <div className='space-y-1'>
          <div className='px-3 py-2'>
            <h4 className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>Quick Actions</h4>
          </div>
          {config.quickActions.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className='h-4 w-4' />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className='border-t p-4'>
        <div className='flex items-center space-x-3'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user.avatarUrl || ''} alt={user.name || ''} />
            <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className='flex-1 space-y-1'>
            <p className='text-sm leading-none font-medium'>{user.name}</p>
            <p className='text-muted-foreground text-xs leading-none'>{user.role.toLowerCase()}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <div className='bg-background flex h-screen'>
      {/* Desktop Sidebar */}
      <div className='bg-card hidden w-64 border-r lg:block'>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side='left' className='w-64 p-0'>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Top Header */}
        <header className='bg-card flex h-16 items-center border-b px-4 lg:px-6'>
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='lg:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
          </Sheet>

          {/* Search */}
          <div className='flex flex-1 items-center space-x-4 lg:space-x-6'>
            <UniversalSearch className='hidden lg:block lg:max-w-sm lg:flex-1' />
          </div>

          {/* Right Side Actions */}
          <div className='flex items-center space-x-4'>
            {/* Notifications */}
            {/* <Button variant='ghost' size='icon' className='relative'>
              <Bell className='h-5 w-5' />
              <span className='absolute -top-1 -right-1 flex h-3 w-3'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75'></span>
                <span className='relative inline-flex h-3 w-3 rounded-full bg-red-500'></span>
              </span>
            </Button> */}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='flex items-center space-x-2'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={user.avatarUrl || ''} alt={user.name || ''} />
                    <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className='hidden text-left lg:block'>
                    <p className='text-sm font-medium'>{user.name}</p>
                    <p className='text-muted-foreground text-xs'>{user.role.toLowerCase()}</p>
                  </div>
                  <ChevronDown className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end'>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/profile' className='flex items-center'>
                    <User className='mr-2 h-4 w-4' />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/settings' className='flex items-center'>
                    <Settings className='mr-2 h-4 w-4' />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='text-red-600 focus:text-red-600' onClick={handleLogout}>
                  <LogOut className='mr-2 h-4 w-4' />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-auto'>{children}</main>
      </div>
    </div>
  );
}
