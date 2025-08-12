// create interface with title , link,icon

import {
  SettingsIcon,
  Home,
  UsersIcon,
  BarChart3,
  Building2,
  Calendar,
  Plus,
  Users,
  MessageSquare,
} from 'lucide-react';

interface Route {
  title: string;
  link: string;
  icon: React.ElementType;
}

export const adminRoutes: Route[] = [
  {
    title: 'Dashboard',
    link: '/admin/dashboard',
    icon: Home,
  },
  {
    title: 'Users',
    link: '/admin/users',
    icon: UsersIcon,
  },
  {
    title: 'Settings',
    link: '/admin/settings',
    icon: SettingsIcon,
  },
];

export const userRoutes: Route[] = [
  {
    title: 'Dashboard',
    link: '/user/dashboard',
    icon: Home,
  },
  {
    title: 'Profile',
    link: '/user/profile',
    icon: UsersIcon,
  },
  {
    title: 'Settings',
    link: '/user/settings',
    icon: SettingsIcon,
  },
];

export const ownerRoutes: Route[] = [
  {
    title: 'Dashboard',
    link: '/owner/dashboard',
    icon: Home,
  },
  {
    title: 'Facilities',
    link: '/owner/facilities',
    icon: UsersIcon,
  },
  {
    title: 'Courts',
    link: '/owner/courts',
    icon: UsersIcon,
  },
  {
    title: 'My Facilities',
    link: '/owner/facilities',
    icon: Building2,
  },
  {
    title: 'Add Facility',
    link: '/owner/facilities/new',
    icon: Plus,
  },
  {
    title: 'Bookings',
    link: '/owner/bookings',
    icon: Calendar,
  },
  {
    title: 'Reviews',
    link: '/owner/reviews',
    icon: MessageSquare,
  },
  {
    title: 'Analytics',
    link: '/owner/analytics',
    icon: BarChart3,
  },
  {
    title: 'Customers',
    link: '/owner/customers',
    icon: Users,
  },
];
