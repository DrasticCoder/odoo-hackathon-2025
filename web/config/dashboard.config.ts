import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  ClipboardList,
  Settings,
  BarChart3,
  Shield,
  Flag,
  UserCheck,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  Bell,
} from 'lucide-react';
import { UserRole } from '@/types/auth.type';

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string | number;
  isActive?: boolean;
}

export interface DashboardConfig {
  mainNav: DashboardNavItem[];
  sidebarNav: DashboardNavItem[];
  quickActions: DashboardNavItem[];
}

export const dashboardConfigs: Record<UserRole, DashboardConfig> = {
  [UserRole.OWNER]: {
    mainNav: [
      {
        title: 'Dashboard',
        href: '/owner/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Facilities',
        href: '/owner/facilities',
        icon: Building2,
      },
      {
        title: 'Courts',
        href: '/owner/courts',
        icon: MapPin,
      },
      {
        title: 'Bookings',
        href: '/owner/bookings',
        icon: Calendar,
      },
      {
        title: 'Availability',
        href: '/owner/availability',
        icon: Clock,
      },
      {
        title: 'Analytics',
        href: '/owner/analytics',
        icon: BarChart3,
      },
    ],
    sidebarNav: [
      {
        title: 'Overview',
        href: '/owner/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Facilities',
        href: '/owner/facilities',
        icon: Building2,
      },
      {
        title: 'Courts',
        href: '/owner/courts',
        icon: MapPin,
      },
      {
        title: 'Bookings',
        href: '/owner/bookings',
        icon: Calendar,
      },
      {
        title: 'Time Slots',
        href: '/owner/availability',
        icon: Clock,
      },
      {
        title: 'Analytics',
        href: '/owner/analytics',
        icon: BarChart3,
      },
      {
        title: 'Reviews',
        href: '/owner/reviews',
        icon: FileText,
      },
    ],
    quickActions: [
      {
        title: 'Add Facility',
        href: '/owner/facilities/add',
        icon: Building2,
      },
      {
        title: 'View Bookings',
        href: '/owner/bookings',
        icon: Calendar,
      },
      {
        title: 'Manage Slots',
        href: '/owner/availability',
        icon: Clock,
      },
    ],
  },
  [UserRole.ADMIN]: {
    mainNav: [
      {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Facilities',
        href: '/admin/facilities',
        icon: Building2,
      },
      {
        title: 'Approvals',
        href: '/admin/approvals',
        icon: UserCheck,
      },
      {
        title: 'Reports',
        href: '/admin/reports',
        icon: Flag,
      },
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
      },
    ],
    sidebarNav: [
      {
        title: 'Overview',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Facility Management',
        href: '/admin/facilities',
        icon: Building2,
      },
      {
        title: 'Facility Approvals',
        href: '/admin/approvals',
        icon: UserCheck,
        badge: 'New',
      },
      {
        title: 'Bookings',
        href: '/admin/bookings',
        icon: Calendar,
      },
      {
        title: 'Reports & Moderation',
        href: '/admin/reports',
        icon: Flag,
      },
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
      },
      {
        title: 'System Settings',
        href: '/admin/settings',
        icon: Settings,
      },
      {
        title: 'Audit Logs',
        href: '/admin/logs',
        icon: Shield,
      },
    ],
    quickActions: [
      {
        title: 'Review Facilities',
        href: '/admin/approvals',
        icon: UserCheck,
      },
      {
        title: 'View Reports',
        href: '/admin/reports',
        icon: Flag,
      },
      {
        title: 'System Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
      },
    ],
  },
  [UserRole.USER]: {
    mainNav: [
      {
        title: 'Home',
        href: '/user/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Venues',
        href: '/venues',
        icon: Building2,
      },
      {
        title: 'My Bookings',
        href: '/user/bookings',
        icon: Calendar,
      },
      {
        title: 'Profile',
        href: '/user/profile',
        icon: Users,
      },
    ],
    sidebarNav: [
      {
        title: 'Home',
        href: '/user/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Browse Venues',
        href: '/venues',
        icon: Building2,
      },
      {
        title: 'My Bookings',
        href: '/user/bookings',
        icon: Calendar,
      },
      {
        title: 'Favorites',
        href: '/user/favorites',
        icon: FileText,
      },
      {
        title: 'Reviews',
        href: '/user/reviews',
        icon: FileText,
      },
      {
        title: 'Profile',
        href: '/user/profile',
        icon: Users,
      },
      {
        title: 'Settings',
        href: '/user/settings',
        icon: Settings,
      },
    ],
    quickActions: [
      {
        title: 'Book Venue',
        href: '/venues',
        icon: Building2,
      },
      {
        title: 'View Bookings',
        href: '/user/bookings',
        icon: Calendar,
      },
    ],
  },
};

export const getDashboardConfig = (role: UserRole): DashboardConfig => {
  return dashboardConfigs[role] || dashboardConfigs[UserRole.USER];
};
