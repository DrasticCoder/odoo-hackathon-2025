'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, TrendingDown, Building2, BarChart3, Plus, IndianRupee } from 'lucide-react';
import { OwnerService } from '@/services/owner.service';
import { OwnerDashboardStats, UpcomingBooking, RecentActivity, BookingTrend } from '@/types/owner.types';
import { toast } from 'sonner';

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsResponse, upcomingResponse, activityResponse, trendsResponse] = await Promise.all([
        OwnerService.getDashboardStats(),
        OwnerService.getUpcomingBookings(10),
        OwnerService.getRecentActivity(20),
        OwnerService.getBookingTrends({ period: selectedPeriod }),
      ]);

      if (statsResponse.data) setStats(statsResponse.data);
      if (upcomingResponse.data) setUpcomingBookings(upcomingResponse.data);
      if (activityResponse.data) setRecentActivity(activityResponse.data);
      if (trendsResponse.data) setBookingTrends(trendsResponse.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimeUntil = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className='text-primary h-4 w-4' />;
    if (growth < 0) return <TrendingDown className='text-destructive h-4 w-4' />;
    return null;
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-6 p-6'>
        <div className='space-y-2'>
          <div className='bg-muted h-8 w-64 animate-pulse rounded'></div>
          <div className='bg-muted h-4 w-96 animate-pulse rounded'></div>
        </div>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className='space-y-2'>
                <div className='bg-muted h-4 w-24 animate-pulse rounded'></div>
                <div className='bg-muted h-8 w-16 animate-pulse rounded'></div>
              </CardHeader>
              <CardContent>
                <div className='bg-muted h-3 w-24 animate-pulse rounded'></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-foreground text-3xl font-bold'>Dashboard Overview</h1>
          <p className='text-muted-foreground mt-1'>Monitor your facilities performance and manage your business</p>
        </div>
        <div className='flex gap-3'>
          <Button asChild>
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

      {/* KPI Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Bookings</CardTitle>
            <Calendar className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.totalBookings || 0}</div>
            <div className='text-muted-foreground flex items-center text-xs'>
              {getGrowthIcon(stats?.growthPercentage || 0)}
              <span className='ml-1'>
                {stats?.growthPercentage && stats.growthPercentage > 0 ? '+' : ''}
                {stats?.growthPercentage || 0}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Courts</CardTitle>
            <Building2 className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.activeCourts || 0}</div>
            <div className='text-muted-foreground flex items-center text-xs'>
              <span>across {stats?.totalFacilities || 0} facilities</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Monthly Earnings</CardTitle>
            <IndianRupee className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(stats?.thisMonthEarnings || 0)}</div>
            <div className='text-muted-foreground flex items-center text-xs'>
              {getGrowthIcon(stats?.growthPercentage || 0)}
              <span className='ml-1'>
                {stats?.growthPercentage && stats.growthPercentage > 0 ? '+' : ''}
                {stats?.growthPercentage || 0}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Occupancy Rate</CardTitle>
            <BarChart3 className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {Math.round(((stats?.confirmedBookings || 0) / Math.max(stats?.totalBookings || 1, 1)) * 100)}%
            </div>
            <div className='text-muted-foreground flex items-center text-xs'>
              <span>average across all courts</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='bookings'>Recent Bookings</TabsTrigger>
          <TabsTrigger value='activity'>Activity</TabsTrigger>
          <TabsTrigger value='trends'>Trends</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Next bookings for your facilities</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {upcomingBookings.length === 0 ? (
                  <p className='text-muted-foreground py-4 text-center'>No upcoming bookings</p>
                ) : (
                  upcomingBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className='flex items-center space-x-4'>
                      <div className='min-w-0 flex-1'>
                        <p className='text-foreground truncate text-sm font-medium'>
                          {booking.facilityName} - {booking.courtName}
                        </p>
                        <p className='text-muted-foreground text-sm'>
                          {booking.userName} • {formatTimeUntil(booking.timeUntilBooking)} from now
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                    </div>
                  ))
                )}
                {upcomingBookings.length > 5 && (
                  <Button asChild variant='outline' className='mt-4 w-full'>
                    <Link href='/owner/bookings'>View All Bookings</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest activities across your facilities</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {recentActivity.length === 0 ? (
                  <p className='text-muted-foreground py-4 text-center'>No recent activity</p>
                ) : (
                  recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className='flex items-start space-x-3'>
                      <div className='min-w-0 flex-1'>
                        <p className='text-foreground text-sm'>{activity.description}</p>
                        <p className='text-muted-foreground text-xs'>
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='bookings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest bookings across all your facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className='flex items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-1'>
                      <p className='font-medium'>
                        {booking.facilityName} - {booking.courtName}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        {booking.userName} • {formatTimeUntil(booking.timeUntilBooking)} from now
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='activity' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>All recent activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {recentActivity.map((activity) => (
                  <div key={activity.id} className='flex items-start space-x-3 rounded-lg border p-4'>
                    <div className='flex-1'>
                      <p className='text-sm'>{activity.description}</p>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='trends' className='space-y-4'>
          <div className='mb-4 flex items-center space-x-2'>
            <label htmlFor='period' className='text-sm font-medium'>
              Period:
            </label>
            <select
              id='period'
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className='rounded border px-3 py-1 text-sm'
            >
              <option value='daily'>Daily</option>
              <option value='weekly'>Weekly</option>
              <option value='monthly'>Monthly</option>
            </select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>
                {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} booking patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {bookingTrends.map((trend, index) => (
                  <div key={index} className='flex items-center justify-between rounded-lg border p-4'>
                    <div>
                      <p className='font-medium'>{trend.date}</p>
                      <p className='text-muted-foreground text-sm'>{trend.bookings} bookings</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>{formatCurrency(trend.earnings)}</p>
                      <p className='text-muted-foreground text-sm'>earnings</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
