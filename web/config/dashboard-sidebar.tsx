// create interface with title , link,icon
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
  SettingsIcon, 
   UsersIcon
} from 'lucide-react';


interface AdminRoute {
  title: string;
  link: string;
  icon: React.ElementType;
}

export const adminRoutes: AdminRoute[] = [
  {
    title: 'User Management',
    link: '/admin/users',
    icon: Users,
  },
  {
    title: 'Reports',
    link: '/admin/reports',
    icon: BarChart3,
  },
  {
    title: 'Facility Approval',
    link: '/admin/facility-approval',
    icon: SettingsIcon,
  },
];

export const userRoutes: AdminRoute[] = [
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

];

export const ownerRoutes: AdminRoute[] = [
  {
      icon: Home,
      title: 'Dashboard',
      link: '/owner/dashboard',
    },
    {
      icon: Building2,
      title: 'Facilities',
      link: '/owner/facilities',
    },
    {
      icon: Shield,
      title: 'Courts',
      link: '/owner/courts',
    },
    {
      icon: Calendar,
      title: 'Bookings',
      link: '/owner/bookings',
    },
    {
      icon: CalendarClock,
      title: 'Time Slots',
      link: '/owner/availability',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      link: '/owner/analytics',
    },
    {
      icon: Users,
      title: 'Customers',
      link: '/owner/customers',
    },
];
