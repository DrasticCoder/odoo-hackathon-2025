// create interface with title , link,icon 

import { SettingsIcon,  Home,UsersIcon } from "lucide-react";

interface AdminRoute {
  title: string;
  link: string;
  icon: React.ElementType;
}

export const adminRoutes: AdminRoute[] = [
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
]

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
  {
    title: 'Settings',
    link: '/user/settings',
    icon: SettingsIcon,
  },
]

export const ownerRoutes: AdminRoute[] = [
  {
    title: 'Dashboard',
    link: '/owner/dashboard',
    icon: Home,
  },
  {
    title: 'Properties',
    link: '/owner/properties',
    icon: UsersIcon,
  },
  {
    title: 'Settings',
    link: '/owner/settings',
    icon: SettingsIcon,
  },
]