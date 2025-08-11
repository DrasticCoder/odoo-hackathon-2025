'use client';

import { useAuthStore } from '@/store';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth.type';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, DollarSign, Users, Plus, BarChart3, Eye, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OwnerDashboard() {
  const { user } = useAuthStore();

  const statsCards = [
    {
      title: 'My Facilities',
      value: '3',
      description: '2 active, 1 pending approval',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Bookings',
      value: '127',
      description: '+15.2% from last month',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Monthly Revenue',
      value: '₹12,450',
      description: '+8.1% from last month',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Courts',
      value: '8',
      description: 'Across all facilities',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <AuthGuard requiredRole={UserRole.OWNER}>
      <DashboardLayout>
        <div className='space-y-6 p-6 bg-background'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-300'>Welcome back, {user?.name}! 🏟️</h1>
              <p className='mt-1 text-gray-400'>Manage your sports facilities and grow your business</p>
            </div>
            <div className='flex gap-3'>
              <Button asChild className='bg-orange-500 hover:bg-orange-600'>
                <Link href='/owner/facilities/add'>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Facility
                </Link>
              </Button>
              <Button asChild variant='outline'>
                <Link href='/owner/analytics'>
                  <BarChart3 className='mr-2 h-4 w-4' />
                  Analytics
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
                      <div className={`rounded-full p-2 ${stat.bgColor}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>{stat.value}</div>
                      <p className='mt-1 text-xs text-gray-600'>{stat.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your facilities and bookings</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Button asChild className='w-full bg-orange-500 hover:bg-orange-600'>
                  <Link href='/owner/facilities/add'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add New Facility
                  </Link>
                </Button>
                <Button asChild variant='outline' className='w-full'>
                  <Link href='/owner/facilities'>
                    <Building2 className='mr-2 h-4 w-4' />
                    Manage Facilities
                  </Link>
                </Button>
                <Button asChild variant='outline' className='w-full'>
                  <Link href='/owner/bookings'>
                    <Eye className='mr-2 h-4 w-4' />
                    View Bookings
                  </Link>
                </Button>
                <Button asChild variant='outline' className='w-full'>
                  <Link href='/owner/analytics'>
                    <TrendingUp className='mr-2 h-4 w-4' />
                    Analytics Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest bookings at your facilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>SportZone Arena - Court 1</p>
                      <p className='text-xs text-gray-600'>Badminton • Today 6:00 PM</p>
                      <Badge className='mt-1 bg-green-100 text-green-700'>Confirmed</Badge>
                    </div>
                    <span className='text-sm font-medium text-green-600'>₹500</span>
                  </div>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>City Sports - Court 2</p>
                      <p className='text-xs text-gray-600'>Tennis • Tomorrow 8:00 AM</p>
                      <Badge className='mt-1 bg-blue-100 text-blue-700'>Upcoming</Badge>
                    </div>
                    <span className='text-sm font-medium text-green-600'>₹800</span>
                  </div>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>Elite Club - Court 3</p>
                      <p className='text-xs text-gray-600'>Basketball • Dec 25 4:00 PM</p>
                      <Badge className='mt-1 bg-orange-100 text-orange-700'>Pending</Badge>
                    </div>
                    <span className='text-sm font-medium text-green-600'>₹1200</span>
                  </div>
                </div>
                <Button asChild variant='outline' className='mt-4 w-full'>
                  <Link href='/owner/bookings'>View All Bookings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Booking Trends
              </CardTitle>
              <CardDescription>Your facility booking performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100'>
                <div className='text-center'>
                  <BarChart3 className='mx-auto mb-4 h-12 w-12 text-orange-400' />
                  <p className='font-medium text-gray-600'>Analytics Chart Coming Soon</p>
                  <p className='mt-1 text-sm text-gray-500'>Detailed booking trends and revenue analytics</p>
                  <Button asChild variant='outline' className='mt-4'>
                    <Link href='/owner/analytics'>View Full Analytics</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
