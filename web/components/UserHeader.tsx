'use client';

import { useState } from 'react';
import { Search, Heart, Calendar, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocationStore } from '@/store/location.store';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

const LOCATIONS = ['Mumbai', 'Delhi', 'Ahmedabad', 'Kolkata', 'Chennai', 'Jaipur'];

export default function UserHeader() {
  const { selectedLocation, setLocation } = useLocationStore();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo and Location */}
          <div className='flex items-center space-x-6'>
            {/* Logo */}
            <Link href='/' className='flex items-center space-x-2'>
              <div className='bg-primary h-8 w-8 rounded-lg'></div>
              <span className='text-foreground text-xl font-bold'>QuickCourt</span>
            </Link>

            {/* Location Dropdown */}
            <div className='hidden md:block'>
              <Select value={selectedLocation ?? undefined} onValueChange={setLocation}>
                <SelectTrigger className='w-48'>
                  <SelectValue placeholder='Please Select' />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Bar */}
          <div className='mx-4 hidden max-w-md flex-1 sm:block'>
            <form onSubmit={handleSearch} className='relative'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Search for venues, sports...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pr-4 pl-10'
              />
            </form>
          </div>

          {/* Mobile Search Button */}
          <div className='sm:hidden'>
            <Button variant='ghost' size='icon'>
              <Search className='h-4 w-4' />
            </Button>
          </div>

          {/* Navigation Links and User Menu */}
          <div className='flex items-center space-x-2'>
            {/* Wishlist */}
            <Link href='/wishlist'>
              <Button variant='ghost' size='icon' className='hidden w-20 md:flex'>
                <Heart className='h-4 w-4' />
                Wishlist
              </Button>
            </Link>

            {/* My Bookings */}
            <Link href='/user/bookings'>
              <Button variant='ghost' size='icon' className='hidden w-40 md:flex'>
                <Calendar className='h-4 w-4' />
                My Bookings
              </Button>
            </Link>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || 'User'} />
                    <AvatarFallback className='bg-primary text-primary-foreground'>
                      {getUserInitials(user?.name || undefined)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                <div className='flex items-center justify-start gap-2 p-2'>
                  <div className='flex flex-col space-y-1 leading-none'>
                    {user?.name && <p className='font-medium'>{user.name}</p>}
                    {user?.email && <p className='text-muted-foreground w-[200px] truncate text-sm'>{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/user/profile' className='flex items-center'>
                    <User className='mr-2 h-4 w-4' />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/user/profile/edit' className='flex items-center'>
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Edit Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Location Selector */}
        <div className='pb-4 md:hidden'>
          <Select value={selectedLocation ?? undefined} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder='Please Select' />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
