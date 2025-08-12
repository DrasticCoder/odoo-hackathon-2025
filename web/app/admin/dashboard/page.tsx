'use client';

import { useCurrentUser, useRefreshUser } from '@/hooks';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth.type';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Shield, Activity, Server, FileCheck2, Ban, FileWarning } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnalyticsService, AnalyticsStats } from '@/services/analytics.service';
// Charts removed from dashboard; detailed analytics available at /admin/analytics

export default function AdminDashboard() {
  const user = useCurrentUser();
  const refreshUser = useRefreshUser();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Dashboard shows only high-level stats; detailed analytics moved to /admin/analytics
  useEffect(() => {
    AnalyticsService.getStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);
  // No inline charts on dashboard

  return (
    <AuthGuard requiredRole={UserRole.ADMIN}>
      <DashboardLayout>
        <div className='space-y-6 p-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-300'>Welcome back, {user?.name}! 🛡️</h1>
              <p className='mt-1 text-gray-600'>Manage your QuickCourt platform and monitor system health</p>
              <div className='mt-2 flex items-center gap-2'>
                <Badge className='bg-purple-100 text-purple-700'>{user?.role}</Badge>
                <Badge className={user?.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {user?.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge className={user?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className='flex gap-3'>
              <Button variant='outline' onClick={refreshUser} className='flex items-center gap-2'>
                <RefreshCw className='h-4 w-4' />
                Refresh Profile
              </Button>
              <Button className='bg-orange-500 hover:bg-orange-600'>
                <Shield className='mr-2 h-4 w-4' />
                Security Center
              </Button>
            </div>
          </div>

          {/* Stats Grid (Live Analytics) */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-primary text-primary-foreground shadow-xl">
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold">{loading ? <span className="animate-pulse">...</span> : stats?.totalUsers}</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary text-secondary-foreground shadow-xl">
              <CardHeader>
                <CardTitle>Total Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold">{loading ? <span className="animate-pulse">...</span> : stats?.totalFacilities}</div>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground shadow-xl">
              <CardHeader>
                <CardTitle>Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold">{loading ? <span className="animate-pulse">...</span> : stats?.totalBookings}</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary text-secondary-foreground shadow-xl">
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold">₹{loading ? <span className="animate-pulse">...</span> : stats?.totalRevenue?.toLocaleString()}</div>
                <div className="text-xs mt-2 text-secondary-foreground/80">Avg. Booking Value: ₹{stats?.averageBookingValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Recent Activities
                </CardTitle>
                <CardDescription>Latest system activities and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3 rounded-lg border p-3'>
                    <div className='h-2 w-2 rounded-full bg-green-500'></div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>New facility approved</p>
                      <p className='text-xs text-gray-600'>SportZone Arena - 2 hours ago</p>
                    </div>
                    <Badge className='bg-green-100 text-green-700'>Approved</Badge>
                  </div>
                  <div className='flex items-center gap-3 rounded-lg border p-3'>
                    <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>New user registered</p>
                      <p className='text-xs text-gray-600'>john@example.com - 4 hours ago</p>
                    </div>
                    <Badge className='bg-blue-100 text-blue-700'>New</Badge>
                  </div>
                  <div className='flex items-center gap-3 rounded-lg border p-3'>
                    <div className='h-2 w-2 rounded-full bg-yellow-500'></div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>Facility pending approval</p>
                      <p className='text-xs text-gray-600'>City Sports Complex - 6 hours ago</p>
                    </div>
                    <Badge className='bg-yellow-100 text-yellow-700'>Pending</Badge>
                  </div>
                </div>
                <Button variant='outline' className='mt-4 w-full'>
                 <Link href='/admin/Activity'>
                  View All Activities
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Server className='h-5 w-5' />
                  System Health
                </CardTitle>
                <CardDescription>Platform performance and health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <span className='text-sm font-medium'>Server Status</span>
                    <Badge className='bg-green-100 text-green-700'>Healthy</Badge>
                  </div>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <span className='text-sm font-medium'>Database</span>
                    <Badge className='bg-green-100 text-green-700'>Connected</Badge>
                  </div>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <span className='text-sm font-medium'>API Response Time</span>
                    <Badge className='bg-yellow-100 text-yellow-700'>245ms</Badge>
                  </div>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <span className='text-sm font-medium'>Active Users</span>
                    <Badge className='bg-blue-100 text-blue-700'>89 online</Badge>
                  </div>
                </div>
                <Button variant='outline' className='mt-4 w-full'>              
                  <Link href='/admin/logs'>
                  View System Logs
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick link to detailed analytics instead of inline charts */}
          <div className='mt-4'>
            <Card className='border-dashed'>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>View booking trends, sports popularity and status distribution</CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div className='text-sm text-muted-foreground'>Detailed interactive charts now live in the dedicated analytics page.</div>
                <Button asChild>
                  <Link href='/admin/analytics'>Go to Analytics</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          {/* Admin Quick Links */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
            <Link href="/admin/facility-approval">
              <Card className="hover:shadow-2xl transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2"><FileCheck2 className="h-5 w-5" /> Facility Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">Approve or reject new facilities</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/user-management">
              <Card className="hover:shadow-2xl transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2"><Shield className="h-5 w-5" /> User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">Manage users and ban/unban</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/reports-moderation">
              <Card className="hover:shadow-2xl transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2"><FileWarning className="h-5 w-5" /> Reports Moderation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">Moderate user and facility reports</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/user-ban-history">
              <Card className="hover:shadow-2xl transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2"><Ban className="h-5 w-5" /> User Ban History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">View all banned users</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
